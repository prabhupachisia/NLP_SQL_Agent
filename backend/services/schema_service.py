from services.db_service import get_connection

def get_schema(connection_model):
    conn = None
    try:
        conn = get_connection(connection_model)
        schema = {}
        with conn.cursor() as cursor:
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()

            for table in tables:
                table_name = list(table.values())[0]
                cursor.execute(f"DESCRIBE {table_name}")
                columns = cursor.fetchall()
                schema[table_name] = [
                    {
                        "column": col["Field"],
                        "type": col["Type"],
                        "nullable": col["Null"],
                        "key": col["Key"],
                        "default": col["Default"]
                    }
                    for col in columns
                ]

        return {"success": True, "schema": schema}

    except Exception as e:
        return {"success": False, "error": str(e)}

    finally:
        if conn:
            conn.close()