from flask import Blueprint, jsonify
from sqlalchemy import func, case
from models.user import User
from models.connection import SavedConnection
from models.query_history import QueryHistory
from database import db
from middleware.admin_middleware import require_admin
from datetime import datetime, timedelta

admin_bp = Blueprint("admin", __name__)

# ============================================================
# 1️⃣ PLATFORM OVERVIEW
# ============================================================

@admin_bp.route("/overview", methods=["GET"])
@require_admin
def overview(admin_user):

    total_users = User.query.count()
    total_connections = SavedConnection.query.count()
    total_queries = QueryHistory.query.count()

    successful = QueryHistory.query.filter_by(status="success").count()
    failed = QueryHistory.query.filter_by(status="failed").count()
    corrected = QueryHistory.query.filter_by(was_corrected=True).count()

    success_rate = successful / total_queries if total_queries else 0
    correction_rate = corrected / total_queries if total_queries else 0

    return jsonify({
        "total_users": total_users,
        "total_connections": total_connections,
        "total_queries": total_queries,
        "success_rate": round(success_rate, 3),
        "correction_rate": round(correction_rate, 3),
    })


# ============================================================
# 2️⃣ SYSTEM HEALTH (Last 24h Activity)
# ============================================================

@admin_bp.route("/system-health", methods=["GET"])
@require_admin
def system_health(admin_user):

    last_24h = datetime.utcnow() - timedelta(hours=24)

    queries_24h = QueryHistory.query.filter(
        QueryHistory.created_at >= last_24h
    ).count()

    failures_24h = QueryHistory.query.filter(
        QueryHistory.created_at >= last_24h,
        QueryHistory.status == "failed"
    ).count()

    avg_latency = db.session.query(
        func.avg(QueryHistory.execution_time)
    ).scalar() or 0

    return jsonify({
        "queries_24h": queries_24h,
        "failures_24h": failures_24h,
        "failure_rate_24h": round(failures_24h / queries_24h, 3) if queries_24h else 0,
        "avg_execution_time": round(avg_latency, 3),
    })


# ============================================================
# 3️⃣ AI METRICS
# ============================================================

@admin_bp.route("/ai-metrics", methods=["GET"])
@require_admin
def ai_metrics(admin_user):

    total = QueryHistory.query.count()

    successful = QueryHistory.query.filter_by(status="success").count()
    failed = QueryHistory.query.filter_by(status="failed").count()
    corrected = QueryHistory.query.filter_by(was_corrected=True).count()

    # Top 5 error types
    error_counts = db.session.query(
        QueryHistory.error,
        func.count(QueryHistory.id)
    ).filter(
        QueryHistory.status == "failed"
    ).group_by(
        QueryHistory.error
    ).order_by(
        func.count(QueryHistory.id).desc()
    ).limit(5).all()

    # Query type distribution (SELECT, INSERT, etc.)
    query_types = {}
    queries = QueryHistory.query.with_entities(QueryHistory.generated_sql).all()

    for (sql,) in queries:
        if not sql:
            continue
        keyword = sql.strip().split(" ")[0].upper()
        query_types[keyword] = query_types.get(keyword, 0) + 1

    return jsonify({
        "total_queries": total,
        "successful": successful,
        "failed": failed,
        "corrected": corrected,
        "success_rate": round(successful / total, 3) if total else 0,
        "correction_rate": round(corrected / total, 3) if total else 0,
        "top_errors": [
            {"error": err, "count": count}
            for err, count in error_counts if err
        ],
        "query_type_distribution": query_types
    })


# ============================================================
# 4️⃣ TIME SERIES (Daily Trends)
# ============================================================

@admin_bp.route("/time-series", methods=["GET"])
@require_admin
def time_series(admin_user):

    results = db.session.query(
        func.date(QueryHistory.created_at).label("date"),
        func.count(QueryHistory.id).label("total"),
        func.sum(case((QueryHistory.status == "success", 1), else_=0)).label("success"),
        func.sum(case((QueryHistory.status == "failed", 1), else_=0)).label("failed"),
        func.sum(case((QueryHistory.was_corrected == True, 1), else_=0)).label("corrected"),
    ).group_by(
        func.date(QueryHistory.created_at)
    ).order_by(
        func.date(QueryHistory.created_at)
    ).all()

    return jsonify({
        "daily": [
            {
                "date": str(r.date),
                "total": r.total,
                "success": r.success or 0,
                "failed": r.failed or 0,
                "corrected": r.corrected or 0
            }
            for r in results
        ]
    })


# ============================================================
# 5️⃣ DATABASE DISTRIBUTION
# ============================================================

@admin_bp.route("/database-distribution", methods=["GET"])
@require_admin
def database_distribution(admin_user):

    db_types = db.session.query(
        SavedConnection.db_type,
        func.count(SavedConnection.id)
    ).group_by(SavedConnection.db_type).all()

    return jsonify({
        "distribution": {
            db_type: count for db_type, count in db_types
        }
    })


# ============================================================
# 6️⃣ LATENCY DISTRIBUTION
# ============================================================

@admin_bp.route("/latency-distribution", methods=["GET"])
@require_admin
def latency_distribution(admin_user):

    buckets = {
        "<0.5s": 0,
        "0.5-1s": 0,
        "1-2s": 0,
        ">2s": 0
    }

    queries = QueryHistory.query.with_entities(QueryHistory.execution_time).all()

    for (t,) in queries:
        if not t:
            continue

        if t < 0.5:
            buckets["<0.5s"] += 1
        elif t < 1:
            buckets["0.5-1s"] += 1
        elif t < 2:
            buckets["1-2s"] += 1
        else:
            buckets[">2s"] += 1

    return jsonify(buckets)


# ============================================================
# 7️⃣ AI HEALTH SCORE
# ============================================================

@admin_bp.route("/ai-health-score", methods=["GET"])
@require_admin
def ai_health_score(admin_user):

    total = QueryHistory.query.count()
    failed = QueryHistory.query.filter_by(status="failed").count()
    corrected = QueryHistory.query.filter_by(was_corrected=True).count()

    score = 100

    if total:
        score -= (failed / total) * 40
        score -= (corrected / total) * 30

    score = max(score, 0)

    return jsonify({
        "ai_health_score": round(score, 2)
    })