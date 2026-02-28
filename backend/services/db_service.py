import re
from sqlalchemy import create_engine, text
from services.encryption_service import decrypt
from services import check_permission
import threading


_engine_cache = {}
_lock = threading.Lock()

def split_sql_statements(sql):
    return [stmt.strip() for stmt in sql.split(";") if stmt.strip()]

def build_connection_url(conn):
    password = decrypt(conn.password)
    host = decrypt(conn.host)
    port = decrypt(conn.port)
    username = decrypt(conn.username)
    database = decrypt(conn.database_name)

    if conn.db_type == "mysql":
        return f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}"

    elif conn.db_type == "postgresql":
        return f"postgresql+psycopg2://{username}:{password}@{host}:{port}/{database}"

    elif conn.db_type == "sqlite":
        return f"sqlite:///{database}"

    elif conn.db_type == "mssql":
        return f"mssql+pyodbc://{username}:{password}@{host}:{port}/{database}?driver=ODBC+Driver+17+for+SQL+Server"
    elif conn.db_type == "oracle":
        return f"oracle+oracledb://{username}:{password}@{host}:{port}/?service_name={database}"

    else:
        raise Exception("Unsupported database type")


def get_engine(conn):
    with _lock:
        if conn.id not in _engine_cache:
            url = build_connection_url(conn)

            engine_kwargs = {
                "pool_pre_ping": True,
                "pool_size": 5,
                "max_overflow": 10,
            }

            if conn.db_type == "postgresql":
                engine_kwargs["connect_args"] = {"sslmode": "require"}

            if conn.db_type == "mysql":
                host = decrypt(conn.host)
                if "." in host:
                    engine_kwargs["connect_args"] = {
                        "ssl": {"ssl_mode": "REQUIRED"}
                    }

            _engine_cache[conn.id] = create_engine(
                url,
                **engine_kwargs
            )

        return _engine_cache[conn.id]


def remove_auto_increment_pk(sql, schema):
    insert_match = re.match(
        r"INSERT\s+INTO\s+(\w+)\s*\((.*?)\)\s*VALUES\s*(.*)",
        sql,
        re.IGNORECASE | re.DOTALL
    )

    if not insert_match:
        return sql

    table = insert_match.group(1)
    columns_part = insert_match.group(2)
    values_part = insert_match.group(3)

    if table not in schema:
        return sql

    pk_columns = schema[table]["primary_key"]

    auto_pk_columns = [
        col["column"]
        for col in schema[table]["columns"]
        if col["column"] in pk_columns and col.get("is_auto_increment")
    ]

    if not auto_pk_columns:
        return sql

    columns = [c.strip() for c in columns_part.split(",")]

    remove_indexes = [
        i for i, col in enumerate(columns)
        if col in auto_pk_columns
    ]

    if not remove_indexes:
        return sql

    new_columns = [
        col for i, col in enumerate(columns)
        if i not in remove_indexes
    ]

    value_groups = re.findall(r"\((.*?)\)", values_part)

    new_value_groups = []
    for group in value_groups:
        vals = [v.strip() for v in group.split(",")]
        new_vals = [
            val for i, val in enumerate(vals)
            if i not in remove_indexes
        ]
        new_value_groups.append("(" + ", ".join(new_vals) + ")")

    new_sql = f"INSERT INTO {table} ({', '.join(new_columns)}) VALUES {', '.join(new_value_groups)}"

    return new_sql

def fix_non_auto_pk_insert(connection, stmt, schema):
    import re

    insert_match = re.match(
        r"INSERT\s+INTO\s+(\w+)\s*\((.*?)\)\s*VALUES\s*(.*)",
        stmt,
        re.IGNORECASE | re.DOTALL
    )

    if not insert_match:
        return stmt

    table = insert_match.group(1)
    columns_part = insert_match.group(2)
    values_part = insert_match.group(3)

    if table not in schema:
        return stmt

    pk_columns = schema[table]["primary_key"]

    # Only support single column numeric PK
    if len(pk_columns) != 1:
        return stmt

    pk_column = pk_columns[0]

    # Check if auto_increment
    col_info = next(
        (col for col in schema[table]["columns"] if col["column"] == pk_column),
        None
    )

    if not col_info:
        return stmt

    if col_info.get("is_auto_increment"):
        return stmt  # Already handled elsewhere

    columns = [c.strip() for c in columns_part.split(",")]

    if pk_column not in columns:
        return stmt  # PK not included

    pk_index = columns.index(pk_column)

    # Get current max ID
    result = connection.execute(
        text(f"SELECT COALESCE(MAX({pk_column}), 0) FROM {table}")
    )
    max_id = result.scalar()

    value_groups = re.findall(r"\((.*?)\)", values_part)

    new_value_groups = []
    next_id = max_id + 1

    for group in value_groups:
        vals = [v.strip() for v in group.split(",")]

        # Replace PK value
        vals[pk_index] = str(next_id)
        next_id += 1

        new_value_groups.append("(" + ", ".join(vals) + ")")

    new_sql = f"INSERT INTO {table} ({', '.join(columns)}) VALUES {', '.join(new_value_groups)}"

    return new_sql

def execute_query(conn, sql):
    
    import services.schema_service as schema_service
    try:
        engine = get_engine(conn)

        statements = split_sql_statements(sql)

        all_rows = []
        total_rows_affected = 0
        schema_result = schema_service.get_schema(conn)
        schema = schema_result["schema"]
        with engine.begin() as connection:
            for stmt in statements:

                stmt = remove_auto_increment_pk(stmt, schema)
                stmt = fix_non_auto_pk_insert(connection, stmt, schema)
                # 🔐 Per-statement permission validation
                permission_result = check_permission(
                    stmt,
                    conn.permission_level
                )

                if not permission_result["allowed"]:
                    return {
                        "success": False,
                        "error": permission_result["reason"]
                    }

                result = connection.execute(text(stmt))

                # If statement returns rows (SELECT)
                if result.returns_rows:
                    rows = [dict(row._mapping) for row in result]
                    all_rows.extend(rows)

                total_rows_affected += result.rowcount

        return {
            "success": True,
            "results": all_rows,
            "rows_affected": total_rows_affected
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def test_connection(conn):
    try:
        engine = get_engine(conn)

        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "success": True,
            "message": "Connection successful."
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }