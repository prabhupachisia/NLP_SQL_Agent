import re

ALWAYS_BLOCKED = ["DROP", "TRUNCATE", "ALTER", "CREATE", "GRANT", "REVOKE", "RENAME"]

PERMISSION_RULES = {
    "read_only": ["SELECT"],
    "read_write": ["SELECT", "INSERT", "UPDATE"],
    "full_access": ["SELECT", "INSERT", "UPDATE", "DELETE"]
}

def get_query_type(sql):
    sql = sql.strip().upper()
    match = re.match(r"^(\w+)", sql)
    return match.group(1) if match else ""

def check_permission(sql, permission_level):
    query_type = get_query_type(sql)

    if query_type in ALWAYS_BLOCKED:
        return {
            "allowed": False,
            "reason": f"'{query_type}' queries are always blocked."
        }

    allowed_operations = PERMISSION_RULES.get(permission_level, [])
    if query_type not in allowed_operations:
        return {
            "allowed": False,
            "reason": f"'{query_type}' is not allowed for permission level '{permission_level}'."
        }

    return {"allowed": True, "reason": None}