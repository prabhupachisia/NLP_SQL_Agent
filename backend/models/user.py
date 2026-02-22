from database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"

    id= db.Column(db.Integer, primary_key=True)
    name= db.Column(db.String(100), nullable=False)
    email= db.Column(db.String(150), unique=True, nullable=False)
    password_hash= db.Column(db.String(255), nullable=False)
    created_at= db.Column(db.DateTime, default=datetime.utcnow)

    connections=db.relationship("SavedConnection", backref="user", lazy=True, cascade="all, delete-orphan")
    api_keys=db.relationship("APIKey", backref="user", lazy=True, cascade="all, delete-orphan")
    query_history = db.relationship("QueryHistory", backref="user", lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id":         self.id,
            "name":       self.name,
            "email":      self.email,
            "created_at": self.created_at.isoformat()
        }