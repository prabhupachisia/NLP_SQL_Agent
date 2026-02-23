from flask import Blueprint, jsonify
from sqlalchemy import func
from models.user import User
from models.connection import SavedConnection
from models.query_history import QueryHistory
from database import db
from middleware.admin_middleware import require_admin
from datetime import datetime

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/overview", methods=["GET"])
@require_admin
def overview(admin_user):
    total_users = User.query.count()
    total_connections = SavedConnection.query.count()
    total_queries = QueryHistory.query.count()

    successful = QueryHistory.query.filter_by(status="success").count()
    failed = QueryHistory.query.filter_by(status="failed").count()

    correction_count = QueryHistory.query.filter(
        QueryHistory.generated_sql != QueryHistory.user_prompt
    ).count()

    success_rate = successful / total_queries if total_queries else 0
    correction_rate = correction_count / total_queries if total_queries else 0

    return jsonify({
        "total_users": total_users,
        "total_connections": total_connections,
        "total_queries": total_queries,
        "success_rate": round(success_rate, 2),
        "correction_rate": round(correction_rate, 2)
    })


@admin_bp.route("/recent-failures", methods=["GET"])
@require_admin
def recent_failures(admin_user):
    failures = QueryHistory.query.filter_by(status="failed")\
        .order_by(QueryHistory.created_at.desc())\
        .limit(20).all()

    return jsonify({
        "failures": [f.to_dict() for f in failures]
    })


@admin_bp.route("/users", methods=["GET"])
@require_admin
def list_users(admin_user):
    users = User.query.all()
    return jsonify({
        "users": [u.to_dict() for u in users]
    })


@admin_bp.route("/connections", methods=["GET"])
@require_admin
def connections_overview(admin_user):
    db_types = db.session.query(
        SavedConnection.db_type,
        func.count(SavedConnection.id)
    ).group_by(SavedConnection.db_type).all()

    return jsonify({
        "database_distribution": {
            db_type: count for db_type, count in db_types
        }
    })

@admin_bp.route("/ai-metrics", methods=["GET"])
@require_admin
def ai_metrics(admin_user):

    total_queries = QueryHistory.query.count()
    successful = QueryHistory.query.filter_by(status="success").count()
    failed = QueryHistory.query.filter_by(status="failed").count()

    corrected = QueryHistory.query.filter_by(was_corrected=True).count()

    # Most common errors
    error_counts = db.session.query(
        QueryHistory.error,
        func.count(QueryHistory.id)
    ).filter(QueryHistory.status == "failed")\
     .group_by(QueryHistory.error)\
     .order_by(func.count(QueryHistory.id).desc())\
     .limit(5).all()

    # Query type distribution
    query_types = {}
    all_queries = QueryHistory.query.all()

    for q in all_queries:
        sql = q.generated_sql.strip().split(" ")[0].upper() if q.generated_sql else "UNKNOWN"
        query_types[sql] = query_types.get(sql, 0) + 1

    return jsonify({
        "total_queries": total_queries,
        "successful": successful,
        "failed": failed,
        "success_rate": round(successful / total_queries, 2) if total_queries else 0,
        "correction_rate": round(corrected / total_queries, 2) if total_queries else 0,
        "top_errors": [
            {"error": err, "count": count}
            for err, count in error_counts if err
        ],
        "query_type_distribution": query_types
    })

@admin_bp.route("/time-series", methods=["GET"])
@require_admin
def query_time_series(admin_user):

    results = db.session.query(
        func.date(QueryHistory.created_at).label("date"),
        func.count(QueryHistory.id).label("total"),
        func.sum(
            func.case(
                (QueryHistory.status == "success", 1),
                else_=0
            )
        ).label("success"),
        func.sum(
            func.case(
                (QueryHistory.status == "failed", 1),
                else_=0
            )
        ).label("failed"),
        func.sum(
            func.case(
                (QueryHistory.was_corrected == True, 1),
                else_=0
            )
        ).label("corrected")
    ).group_by(func.date(QueryHistory.created_at))\
     .order_by(func.date(QueryHistory.created_at))\
     .all()

    return jsonify({
        "daily_queries": [
            {
                "date": str(row.date),
                "total": row.total,
                "success": row.success or 0,
                "failed": row.failed or 0,
                "corrected": row.corrected or 0
            }
            for row in results
        ]
    })