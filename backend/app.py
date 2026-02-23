from flask import Flask
from flask_cors import CORS
from config import Config
from database import init_db
# from flask_limiter import Limiter
# from flask_limiter.util import get_remote_address

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)

    init_db(app)

    # limiter = Limiter(
    # key_func=get_remote_address,
    # default_limits=["200 per day", "50 per hour"]
    # )

    # limiter.init_app(app)
    # app.limiter = limiter

    from routes import auth_bp, connections_bp, query_bp, schema_bp, apikeys_bp, history_bp, admin_bp

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


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)