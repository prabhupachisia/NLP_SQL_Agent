from sqlalchemy import create_engine, text
from services.encryption_service import decrypt
import threading

_engine_cache = {}
_lock = threading.Lock()


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
            _engine_cache[conn.id] = create_engine(
                url,
                pool_pre_ping=True,
                pool_size=5,
                max_overflow=10
            )
        return _engine_cache[conn.id]



def execute_query(conn, sql):
    try:
        engine = get_engine(conn)

        with engine.connect() as connection:
            result = connection.execute(text(sql))

            if result.returns_rows:
                rows = [dict(row._mapping) for row in result]
            else:
                rows = []

            return {
                "success": True,
                "results": rows,
                "rows_affected": result.rowcount
            }

    except Exception as e:
        return {"success": False, "error": str(e)}


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