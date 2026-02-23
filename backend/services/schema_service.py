from sqlalchemy import inspect
from services.db_service import get_engine
from services.rag_service import build_schema_embeddings
import time

_schema_cache = {}
SCHEMA_CACHE_TTL = 600  # 10 minutes

def get_schema(conn):
    try:
        current_time = time.time()

        # Check cache
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

            schema[table] = {
                "columns": [
                    {
                        "column": col["name"],
                        "type": str(col["type"])
                    }
                    for col in columns
                ],
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

        build_schema_embeddings(conn.id, schema)

        _schema_cache[conn.id] = {
            "schema": schema,
            "timestamp": current_time
        }

        return {"success": True, "schema": schema}

    except Exception as e:
        return {"success": False, "error": str(e)}