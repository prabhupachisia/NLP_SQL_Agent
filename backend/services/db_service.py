import pymysql
from services.encryption_service import decrypt

def get_connection(connection_model):
    host = decrypt(connection_model.host)
    port = int(decrypt(connection_model.port))
    username = decrypt(connection_model.username)
    password = decrypt(connection_model.password)
    database_name = decrypt(connection_model.database_name)

    conn = pymysql.connect(
        host=host,
        port=port,
        user=username,
        password=password,
        database=database_name,
        cursorclass=pymysql.cursors.DictCursor
    )
    return conn

def execute_query(connection_model, sql):
    conn = None
    try:
        conn = get_connection(connection_model)
        with conn.cursor() as cursor:
            cursor.execute(sql)
            query_type = sql.strip().upper().split()[0]
            if query_type == "SELECT":
                results = cursor.fetchall()
                return {"results": results, "rows_affected": len(results)}
            else:
                conn.commit()
                return {"results": [], "rows_affected": cursor.rowcount}

    except pymysql.Error as e:
        return {"error": str(e), "results": None, "rows_affected": 0}

    finally:
        if conn:
            conn.close()

def test_connection(connection_model):
    try:
        conn = get_connection(connection_model)
        conn.close()
        return {"success": True, "message": "Connection successful."}
    except pymysql.Error as e:
        return {"success": False, "message": str(e)}