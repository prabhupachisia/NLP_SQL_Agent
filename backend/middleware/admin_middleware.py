from functools import wraps
from flask import jsonify
from middleware.auth_middleware import require_auth

def require_admin(f):
    @require_auth
    @wraps(f)
    def decorated(user, *args, **kwargs):
        if user.role != "admin":
            return jsonify({"error": "Admin access required."}), 403
        return f(user, *args, **kwargs)
    return decorated