from database import db
from datetime import datetime

class SavedConnection(db.Model):
    __tablename__ = "saved_connections"

    id= db.Column(db.Integer, primary_key=True)
    user_id= db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name= db.Column(db.String(100), nullable=False)
    db_type= db.Column(db.String(50), nullable=False)

    # All sensitive fields stored encrypted
    host= db.Column(db.Text, nullable=False)
    port= db.Column(db.Text, nullable=False)
    username= db.Column(db.Text, nullable=False)
    password= db.Column(db.Text, nullable=False)
    database_name= db.Column(db.Text, nullable=False)

    # "read_only"   → SELECT only
    # "read_write"  → SELECT, INSERT, UPDATE
    # "full_access" → SELECT, INSERT, UPDATE, DELETE
    permission_level = db.Column(db.String(20), nullable=False, default="read_only")

    created_at= db.Column(db.DateTime, default=datetime.utcnow)
    updated_at= db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id":self.id,
            "user_id":self.user_id,
            "name":self.name,
            "db_type":self.db_type,
            "permission_level":self.permission_level,
            "created_at":self.created_at.isoformat(),
            "updated_at":self.updated_at.isoformat()
        }