import os
import hashlib
from flask import Blueprint, request, jsonify
from database import db
from models.apikey import APIKey
from middleware.auth_middleware import require_auth

apikeys_bp = Blueprint("apikeys", __name__)

@apikeys_bp.route("/", methods=["GET"])
@require_auth
def get_api_keys(user):
    keys = APIKey.query.filter_by(user_id=user.id).all()
    return jsonify({"api_keys": [k.to_dict() for k in keys]}), 200


@apikeys_bp.route("/", methods=["POST"])
@require_auth
def generate_api_key(user):
    data = request.get_json()

    if not data or not data.get("name"):
        return jsonify({"error": "Key name is required."}), 400

    raw_key = os.urandom(32).hex()
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

    api_key = APIKey(
        user_id=user.id,
        name=data["name"],
        key_hash=key_hash
    )
    db.session.add(api_key)
    db.session.commit()

    return jsonify({
        "message": "API key generated successfully. Copy this key now, it will not be shown again.",
        "api_key": raw_key,
        "key_info": api_key.to_dict()
    }), 201


@apikeys_bp.route("/<int:key_id>", methods=["DELETE"])
@require_auth
def revoke_api_key(user, key_id):
    api_key = APIKey.query.filter_by(id=key_id, user_id=user.id).first()
    if not api_key:
        return jsonify({"error": "API key not found."}), 404

    api_key.is_active = False
    db.session.commit()
    return jsonify({"message": "API key revoked successfully."}), 200