from flask import Blueprint, request, jsonify
from database import db
from models.connection import SavedConnection
from models.query_history import QueryHistory
from middleware.auth_middleware import require_auth
from flask import current_app
from services import (
    get_schema,
    generate_sql,
    correct_sql,
    check_permission,
    execute_query
)
from services.rag_service import retrieve_relevant_tables

def should_retry(error_message):
    error_message = error_message.lower()

    retry_keywords = [
        "syntax",
        "does not exist",
        "unknown column",
        "unknown table",
        "invalid identifier"
    ]

    return any(keyword in error_message for keyword in retry_keywords)

query_bp = Blueprint("query", __name__)


@query_bp.route("/", methods=["POST"])
@require_auth
#@current_app.limiter.limit("10 per minute")
def run_query(user):
    data = request.get_json()

    if not data or not data.get("connection_id") or not data.get("prompt"):
        return jsonify({"error": "connection_id and prompt are required."}), 400

    connection = SavedConnection.query.filter_by(
        id=data["connection_id"],
        user_id=user.id
    ).first()

    if not connection:
        return jsonify({"error": "Connection not found."}), 404

    # ----------------------------------
    # STEP 1: Fetch Schema
    # ----------------------------------
    schema_result = get_schema(connection)

    if not schema_result["success"]:
        return jsonify({
            "error": "Failed to fetch schema.",
            "details": schema_result["error"]
        }), 400

    full_schema = schema_result["schema"]

    # ----------------------------------
    # STEP 2: RAG - Retrieve Relevant Tables
    # ----------------------------------
    relevant_tables = retrieve_relevant_tables(
        connection.id,
        data["prompt"]
    )

    if relevant_tables:
        filtered_schema = {
            table: full_schema[table]
            for table in relevant_tables
            if table in full_schema
        }

        if not filtered_schema:
            filtered_schema = full_schema
    else:
        filtered_schema = full_schema

    # ----------------------------------
    # STEP 3: Generate SQL
    # ----------------------------------
    sql_result = generate_sql(
        filtered_schema,
        data["prompt"],
        connection.db_type
    )

    if not sql_result["success"]:
        return jsonify({
            "error": "Failed to generate SQL.",
            "details": sql_result["error"]
        }), 400

    generated_sql = sql_result["sql"]

    # ----------------------------------
    # STEP 4: Permission Check
    # ----------------------------------
    permission_result = check_permission(
        generated_sql,
        connection.permission_level
    )

    if not permission_result["allowed"]:
        save_history(
            user.id,
            connection.id,
            data["prompt"],
            generated_sql,
            status="failed",
            error=permission_result["reason"],
            rows_affected=0,
            was_corrected=False
        )

        return jsonify({
            "error": permission_result["reason"],
            "sql": generated_sql
        }), 403

    # ----------------------------------
    # STEP 5: Execute Query
    # ----------------------------------
    execution_result = execute_query(connection, generated_sql)

    # ----------------------------------
    # STEP 6: Smart Self-Correction
    # ----------------------------------
    if not execution_result.get("success") and should_retry(execution_result["error"]):

        correction_result = correct_sql(
            full_schema,
            data["prompt"],
            generated_sql,
            execution_result["error"],
            connection.db_type
        )

        if correction_result.get("success"):

            corrected_sql = correction_result["sql"]

            permission_result = check_permission(
                corrected_sql,
                connection.permission_level
            )

            if permission_result["allowed"]:

                retry_result = execute_query(connection, corrected_sql)

                if retry_result.get("success"):

                    save_history(
                        user.id,
                        connection.id,
                        data["prompt"],
                        corrected_sql,
                        status="success",
                        error=None,
                        rows_affected=retry_result["rows_affected"],
                        was_corrected=True
                    )

                    return jsonify({
                        "sql": corrected_sql,
                        "results": retry_result["results"],
                        "rows_affected": retry_result["rows_affected"],
                        "corrected": True
                    }), 200

        # Correction failed
        save_history(
            user.id,
            connection.id,
            data["prompt"],
            generated_sql,
            status="failed",
            error=execution_result["error"],
            rows_affected=0,
            was_corrected=False
        )

        return jsonify({
            "error": execution_result["error"],
            "sql": generated_sql
        }), 400

    # ----------------------------------
    # STEP 7: Final Success (No Correction Needed)
    # ----------------------------------
    if execution_result.get("success"):

        save_history(
            user.id,
            connection.id,
            data["prompt"],
            generated_sql,
            status="success",
            error=None,
            rows_affected=execution_result["rows_affected"],
            was_corrected=False
        )

        return jsonify({
            "sql": generated_sql,
            "results": execution_result["results"],
            "rows_affected": execution_result["rows_affected"],
            "corrected": False
        }), 200

    # ----------------------------------
    # STEP 8: Final Failure (No Retry Allowed)
    # ----------------------------------
    save_history(
        user.id,
        connection.id,
        data["prompt"],
        generated_sql,
        status="failed",
        error=execution_result["error"],
        rows_affected=0,
        was_corrected=False
    )

    return jsonify({
        "error": execution_result["error"],
        "sql": generated_sql
    }), 400

def save_history(user_id, connection_id, prompt, sql, status, error, rows_affected, was_corrected=False):
    history = QueryHistory(
        user_id=user_id,
        connection_id=connection_id,
        user_prompt=prompt,
        generated_sql=sql,
        status=status,
        error=error,
        rows_affected=rows_affected,
        was_corrected=was_corrected
    )
    db.session.add(history)
    db.session.commit()