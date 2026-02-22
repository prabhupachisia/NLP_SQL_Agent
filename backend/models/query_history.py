from database import db
from datetime import datetime

class QueryHistory(db.Model):
    __tablename__ = "query_history"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    connection_id = db.Column(db.Integer, db.ForeignKey("saved_connections.id"), nullable=False)
    user_prompt = db.Column(db.Text, nullable=False)
    generated_sql = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # "success" or "failed"
    error = db.Column(db.Text, nullable=True)
    rows_affected = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "connection_id": self.connection_id,
            "user_prompt": self.user_prompt,
            "generated_sql": self.generated_sql,
            "status": self.status,
            "error": self.error,
            "rows_affected": self.rows_affected,
            "created_at": self.created_at.isoformat()
        }