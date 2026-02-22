from flask import Blueprint, jsonify
from models.query_history import QueryHistory
from middleware.auth_middleware import require_auth

history_bp = Blueprint("history", __name__)

@history_bp.route("/", methods=["GET"])
@require_auth
def get_history(user):
    history = QueryHistory.query.filter_by(user_id=user.id).order_by(QueryHistory.created_at.desc()).all()
    return jsonify({"history": [h.to_dict() for h in history]}), 200


@history_bp.route("/<int:connection_id>", methods=["GET"])
@require_auth
def get_history_by_connection(user, connection_id):
    history = QueryHistory.query.filter_by(user_id=user.id, connection_id=connection_id).order_by(QueryHistory.created_at.desc()).all()
    return jsonify({"history": [h.to_dict() for h in history]}), 200


@history_bp.route("/<int:history_id>", methods=["DELETE"])
@require_auth
def delete_history(user, history_id):
    history = QueryHistory.query.filter_by(id=history_id, user_id=user.id).first()
    if not history:
        return jsonify({"error": "History record not found."}), 404

    from database import db
    db.session.delete(history)
    db.session.commit()
    return jsonify({"message": "History record deleted successfully."}), 200