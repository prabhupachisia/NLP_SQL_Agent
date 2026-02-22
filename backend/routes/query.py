from flask import Blueprint, request, jsonify
from database import db
from models.connection import SavedConnection
from models.query_history import QueryHistory
from services.schema_service import get_schema
from services.groq_service import generate_sql
from services.permission_service import check_permission
from services.db_service import execute_query
from middleware.auth_middleware import require_auth

query_bp = Blueprint("query", __name__)

@query_bp.route("/", methods=["POST"])
@require_auth
def run_query(user):
    data = request.get_json()

    if not data or not data.get("connection_id") or not data.get("prompt"):
        return jsonify({"error": "connection_id and prompt are required."}), 400

    connection = SavedConnection.query.filter_by(id=data["connection_id"], user_id=user.id).first()
    if not connection:
        return jsonify({"error": "Connection not found."}), 404

    # Step 1: fetch schema
    schema_result = get_schema(connection)
    if not schema_result["success"]:
        return jsonify({"error": "Failed to fetch schema.", "details": schema_result["error"]}), 400

    # Step 2: generate SQL from prompt
    sql_result = generate_sql(schema_result["schema"], data["prompt"])
    if not sql_result["success"]:
        return jsonify({"error": "Failed to generate SQL.", "details": sql_result["error"]}), 400

    generated_sql = sql_result["sql"]

    # Step 3: check permissions
    permission_result = check_permission(generated_sql, connection.permission_level)
    if not permission_result["allowed"]:
        save_history(user.id, connection.id, data["prompt"], generated_sql, "failed", permission_result["reason"], 0)
        return jsonify({"error": permission_result["reason"], "sql": generated_sql}), 403

    # Step 4: execute query
    execution_result = execute_query(connection, generated_sql)
    if "error" in execution_result:
        save_history(user.id, connection.id, data["prompt"], generated_sql, "failed", execution_result["error"], 0)
        return jsonify({"error": execution_result["error"], "sql": generated_sql}), 400

    # Step 5: save to history and return results
    save_history(user.id, connection.id, data["prompt"], generated_sql, "success", None, execution_result["rows_affected"])

    return jsonify({
        "sql": generated_sql,
        "results": execution_result["results"],
        "rows_affected": execution_result["rows_affected"]
    }), 200


def save_history(user_id, connection_id, prompt, sql, status, error, rows_affected):
    history = QueryHistory(
        user_id=user_id,
        connection_id=connection_id,
        user_prompt=prompt,
        generated_sql=sql,
        status=status,
        error=error,
        rows_affected=rows_affected
    )
    db.session.add(history)
    db.session.commit()