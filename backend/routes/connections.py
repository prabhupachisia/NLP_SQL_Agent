from flask import Blueprint, request, jsonify
from database import db
from models.connection import SavedConnection
from services.encryption_service import encrypt
from services.db_service import test_connection
from middleware.auth_middleware import require_auth

connections_bp = Blueprint("connections", __name__)

@connections_bp.route("/", methods=["GET"])
@require_auth
def get_connections(user):
    connections = SavedConnection.query.filter_by(user_id=user.id).all()
    return jsonify({"connections": [c.to_dict() for c in connections]}), 200


@connections_bp.route("/", methods=["POST"])
@require_auth
def add_connection(user):
    data = request.get_json()

    required = ["name", "db_type", "host", "port", "username", "password", "database_name", "permission_level"]
    if not data or not all(data.get(f) for f in required):
        return jsonify({"error": "All connection fields are required."}), 400

    if data["permission_level"] not in ["read_only", "read_write", "full_access"]:
        return jsonify({"error": "Invalid permission level."}), 400

    connection = SavedConnection(
        user_id=user.id,
        name=data["name"],
        db_type=data["db_type"],
        host=encrypt(data["host"]),
        port=encrypt(str(data["port"])),
        username=encrypt(data["username"]),
        password=encrypt(data["password"]),
        database_name=encrypt(data["database_name"]),
        permission_level=data["permission_level"]
    )
    db.session.add(connection)
    db.session.commit()

    return jsonify({"message": "Connection added successfully.", "connection": connection.to_dict()}), 201


@connections_bp.route("/<int:connection_id>", methods=["PUT"])
@require_auth
def update_connection(user, connection_id):
    connection = SavedConnection.query.filter_by(id=connection_id, user_id=user.id).first()
    if not connection:
        return jsonify({"error": "Connection not found."}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided."}), 400

    if data.get("name"): connection.name = data["name"]
    if data.get("db_type"): connection.db_type = data["db_type"]
    if data.get("host"): connection.host = encrypt(data["host"])
    if data.get("port"): connection.port = encrypt(str(data["port"]))
    if data.get("username"): connection.username = encrypt(data["username"])
    if data.get("password"): connection.password = encrypt(data["password"])
    if data.get("database_name"): connection.database_name = encrypt(data["database_name"])
    if data.get("permission_level"):
        if data["permission_level"] not in ["read_only", "read_write", "full_access"]:
            return jsonify({"error": "Invalid permission level."}), 400
        connection.permission_level = data["permission_level"]

    db.session.commit()
    return jsonify({"message": "Connection updated successfully.", "connection": connection.to_dict()}), 200


@connections_bp.route("/<int:connection_id>", methods=["DELETE"])
@require_auth
def delete_connection(user, connection_id):
    connection = SavedConnection.query.filter_by(id=connection_id, user_id=user.id).first()
    if not connection:
        return jsonify({"error": "Connection not found."}), 404

    db.session.delete(connection)
    db.session.commit()
    return jsonify({"message": "Connection deleted successfully."}), 200


@connections_bp.route("/<int:connection_id>/test", methods=["POST"])
@require_auth
def test_connection_route(user, connection_id):
    connection = SavedConnection.query.filter_by(id=connection_id, user_id=user.id).first()
    if not connection:
        return jsonify({"error": "Connection not found."}), 404

    result = test_connection(connection)
    status_code = 200 if result["success"] else 400
    return jsonify(result), status_code