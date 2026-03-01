from sqlalchemy import inspect, text
from services.db_service import get_engine
from services.rag_service import build_schema_index
import time

_schema_cache = {}
SCHEMA_CACHE_TTL = 600  # 10 minutes


def detect_auto_increment(engine, inspector, table_name, column):
    """
    Detect whether a column is auto-generated depending on DB type.
    Supports MySQL, PostgreSQL, SQLite, MSSQL.
    """
    dialect = engine.dialect.name.lower()

    # -------------------------
    # MySQL
    # -------------------------
    if dialect == "mysql":
        try:
            result = engine.execute(
                text(f"SHOW COLUMNS FROM `{table_name}` LIKE :col"),
                {"col": column}
            ).fetchone()

            if result and "auto_increment" in str(result):
                return True
        except Exception:
            pass

    # -------------------------
    # PostgreSQL
    # -------------------------
    elif dialect == "postgresql":
        try:
            result = engine.execute(text("""
                SELECT column_default
                FROM information_schema.columns
                WHERE table_name = :table
                AND column_name = :col
            """), {"table": table_name, "col": column}).fetchone()

            if result and result[0] and "nextval" in result[0]:
                return True
        except Exception:
            pass

    # -------------------------
    # SQLite
    # -------------------------
    elif dialect == "sqlite":
        # SQLite auto increment only applies to INTEGER PRIMARY KEY
        pk = inspector.get_pk_constraint(table_name)
        if column in pk.get("constrained_columns", []):
            col_info = next(
                (c for c in inspector.get_columns(table_name) if c["name"] == column),
                None
            )
            if col_info and "INTEGER" in str(col_info["type"]).upper():
                return True

    # -------------------------
    # MSSQL
    # -------------------------
    elif dialect in ["mssql", "sql server"]:
        try:
            result = engine.execute(text("""
                SELECT COLUMNPROPERTY(
                    OBJECT_ID(:table),
                    :col,
                    'IsIdentity'
                )
            """), {"table": table_name, "col": column}).fetchone()

            if result and result[0] == 1:
                return True
        except Exception:
            pass

    return False


def get_schema(conn):
    try:
        current_time = time.time()

        # -------------------------
        # Cache Check
        # -------------------------
        if conn.id in _schema_cache:
            cached_entry = _schema_cache[conn.id]
            if current_time - cached_entry["timestamp"] < SCHEMA_CACHE_TTL:
                return {"success": True, "schema": cached_entry["schema"]}

        engine = get_engine(conn)
        inspector = inspect(engine)

        schema = {}
        tables = inspector.get_table_names()

        for table in tables:
            columns = inspector.get_columns(table)
            pk = inspector.get_pk_constraint(table)
            fks = inspector.get_foreign_keys(table)

            enriched_columns = []

            for col in columns:
                is_auto = detect_auto_increment(
                    engine,
                    inspector,
                    table,
                    col["name"]
                )

                enriched_columns.append({
                    "column": col["name"],
                    "type": str(col["type"]),
                    "nullable": col.get("nullable", True),
                    "default": str(col.get("default")) if col.get("default") else None,
                    "is_auto_increment": is_auto
                })

            schema[table] = {
                "columns": enriched_columns,
                "primary_key": pk.get("constrained_columns", []),
                "foreign_keys": [
                    {
                        "column": fk["constrained_columns"],
                        "references_table": fk["referred_table"],
                        "references_column": fk["referred_columns"]
                    }
                    for fk in fks
                ]
            }

        # -------------------------
        # Build RAG Embeddings
        # -------------------------
        build_schema_index(conn.id, schema)

        # -------------------------
        # Cache Schema
        # -------------------------
        _schema_cache[conn.id] = {
            "schema": schema,
            "timestamp": current_time
        }

        return {"success": True, "schema": schema}

    except Exception as e:
        return {"success": False, "error": str(e)}