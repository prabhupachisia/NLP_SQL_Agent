import os
from flask import Flask
from flask_cors import CORS
from config import Config
from database import init_db, db
from models.user import User
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()


def create_default_admin():
    admin_email = os.getenv("DEFAULT_ADMIN_EMAIL")
    admin_password = os.getenv("DEFAULT_ADMIN_PASSWORD")

    if not admin_email or not admin_password:
        print("⚠️ Admin credentials not set. Skipping admin creation.")
        return

    existing_admin = User.query.filter_by(email=admin_email).first()

    if not existing_admin:
        hashed_password = bcrypt.generate_password_hash(admin_password).decode("utf-8")

        admin_user = User(
            name="Super Admin",
            email=admin_email,
            password_hash=hashed_password,
            role="admin"
        )
        db.session.add(admin_user)
        db.session.commit()
        print("✅ Default admin created")
    else:
        print("ℹ️ Admin already exists")


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    bcrypt.init_app(app)

    app.url_map.strict_slashes = False

    # Allow localhost + production frontend
    frontend_url = os.getenv("FRONTEND_URL")

    allowed_origins = ["http://localhost:5173"]

    if frontend_url:
        allowed_origins.append(frontend_url)

    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-API-Key"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    init_db(app)

    with app.app_context():
        create_default_admin()

    from routes import (
        auth_bp,
        connections_bp,
        query_bp,
        schema_bp,
        apikeys_bp,
        history_bp,
        admin_bp
    )

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(connections_bp, url_prefix="/api/connections")
    app.register_blueprint(history_bp, url_prefix="/api/history")
    app.register_blueprint(query_bp, url_prefix="/api/query")
    app.register_blueprint(schema_bp, url_prefix="/api/schema")
    app.register_blueprint(apikeys_bp, url_prefix="/api/apikeys")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.route("/")
    def health_check():
        return {"status": "ok", "message": "NL to SQL API is running"}, 200

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)