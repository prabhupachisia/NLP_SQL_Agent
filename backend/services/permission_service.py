import sqlparse
from sqlparse.tokens import Keyword, DML

ALWAYS_BLOCKED = {"DROP", "TRUNCATE", "ALTER", "CREATE", "GRANT", "REVOKE", "RENAME"}

PERMISSION_RULES = {
    "read_only": {"SELECT"},
    "read_write": {"SELECT", "INSERT", "UPDATE"},
    "full_access": {"SELECT", "INSERT", "UPDATE", "DELETE"}
}

DANGEROUS_KEYWORDS = {"INTO OUTFILE", "LOAD_FILE", "XP_CMDSHELL"}


def check_permission(sql, permission_level):
    try:
        parsed = sqlparse.parse(sql)
        
        statement = parsed[0]
        statement_type = statement.get_type()

        # 🚨 Block unknown types
        if statement_type == "UNKNOWN":
            return {
                "allowed": False,
                "reason": "Unrecognized SQL statement."
            }

        # 🚨 Always blocked operations
        if statement_type in ALWAYS_BLOCKED:
            return {
                "allowed": False,
                "reason": f"'{statement_type}' queries are always blocked."
            }

        # 🚨 Permission-based blocking
        allowed_operations = PERMISSION_RULES.get(permission_level, set())
        if statement_type not in allowed_operations:
            return {
                "allowed": False,
                "reason": f"'{statement_type}' not allowed for permission level '{permission_level}'."
            }

        # 🚨 Block dangerous internal keywords
        sql_upper = sql.upper()
        for keyword in DANGEROUS_KEYWORDS:
            if keyword in sql_upper:
                return {
                    "allowed": False,
                    "reason": f"Use of dangerous keyword '{keyword}' is blocked."
                }

        return {"allowed": True, "reason": None}

    except Exception as e:
        return {
            "allowed": False,
            "reason": f"Permission validation failed: {str(e)}"
        }