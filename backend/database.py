from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
    with app.app_context():
        from models.user import User
        from models.connection import SavedConnection
        from models.apikey import APIKey
        from models.query_history import QueryHistory
        db.create_all()
        print("Database initialized successfully.")