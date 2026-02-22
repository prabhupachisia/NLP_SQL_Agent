import jwt
import hashlib
from functools import wraps
from flask import request, jsonify, current_app
from models.user import User
from models.apikey import APIKey

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = None

        # Check for API key in headers
        api_key = request.headers.get("X-API-Key")
        if api_key:
            key_hash = hashlib.sha256(api_key.encode()).hexdigest()
            api_key_record = APIKey.query.filter_by(key_hash=key_hash, is_active=True).first()
            if not api_key_record:
                return jsonify({"error": "Invalid or inactive API key."}), 401
            user = User.query.get(api_key_record.user_id)

        # Check for JWT token in headers
        else:
            token = request.headers.get("Authorization")
            if not token or not token.startswith("Bearer "):
                return jsonify({"error": "Authentication required."}), 401
            try:
                token = token.split(" ")[1]
                payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
                user = User.query.get(payload["user_id"])
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token has expired."}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "Invalid token."}), 401

        if not user:
            return jsonify({"error": "User not found."}), 401

        # Pass user to the route
        return f(user, *args, **kwargs)

    return decorated