from flask import Blueprint, jsonify
from models.connection import SavedConnection
from services.schema_service import get_schema
from middleware.auth_middleware import require_auth

schema_bp = Blueprint("schema", __name__)

@schema_bp.route("/<int:connection_id>", methods=["GET"])
@require_auth
def fetch_schema(user, connection_id):
    connection = SavedConnection.query.filter_by(id=connection_id, user_id=user.id).first()
    if not connection:
        return jsonify({"error": "Connection not found."}), 404

    result = get_schema(connection)
    if not result["success"]:
        return jsonify({"error": result["error"]}), 400

    return jsonify({"schema": result["schema"]}), 200