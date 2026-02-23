import jwt
import hashlib
from datetime import datetime
from functools import wraps
from flask import request, jsonify, current_app
from models.user import User
from models.apikey import APIKey
from database import db
from flask import g

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = None
        api_key = request.headers.get("X-API-Key")

        # --------------------------------------------------
        # API KEY AUTHENTICATION
        # --------------------------------------------------
        if api_key:
            key_hash = hashlib.sha256(api_key.encode()).hexdigest()

            api_key_record = APIKey.query.filter_by(
                key_hash=key_hash,
                is_active=True
            ).first()

            if not api_key_record:
                return jsonify({"error": "Invalid API key."}), 401

            # Expiry check
            if api_key_record.expires_at and api_key_record.expires_at < datetime.utcnow():
                return jsonify({"error": "API key expired."}), 401

            user = User.query.get(api_key_record.user_id)

            if not user:
                return jsonify({"error": "User not found."}), 401

            # Track usage safely
            api_key_record.usage_count = (api_key_record.usage_count or 0) + 1
            api_key_record.last_used_at = datetime.utcnow()
            db.session.commit()

            # Store context for rate limiting & logging
            g.current_user = user
            g.auth_method = "api_key"
            g.api_key_id = api_key_record.id

        # --------------------------------------------------
        # JWT AUTHENTICATION
        # --------------------------------------------------
        else:
            token = request.headers.get("Authorization")

            if not token or not token.startswith("Bearer "):
                return jsonify({"error": "Authentication required."}), 401

            try:
                token = token.split(" ")[1]

                payload = jwt.decode(
                    token,
                    current_app.config["SECRET_KEY"],
                    algorithms=["HS256"],
                    options={"require": ["exp", "iat"]}
                )

                user = User.query.get(payload["user_id"])

                if not user:
                    return jsonify({"error": "User not found."}), 401

                # Store context
                g.current_user = user
                g.auth_method = "jwt"
                g.api_key_id = None

            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expired."}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "Invalid token."}), 401

        # Final safety check
        if not user:
            return jsonify({"error": "Authentication failed."}), 401

        return f(user, *args, **kwargs)

    return decorated


def require_role(role):
    def decorator(f):
        @wraps(f)
        def wrapper(user, *args, **kwargs):
            if user.role != role:
                return jsonify({"error": "Unauthorized"}), 403
            return f(user, *args, **kwargs)
        return wrapper
    return decorator