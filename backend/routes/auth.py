import jwt
import hashlib
import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_bcrypt import Bcrypt
from database import db
from models.user import User

auth_bp = Blueprint("auth", __name__)
bcrypt = Bcrypt()

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data or not data.get("name") or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Name, email and password are required."}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered."}), 409

    password_hash = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=password_hash
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully.", "user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required."}), 400

    user = User.query.filter_by(email=data["email"]).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, data["password"]):
        return jsonify({"error": "Invalid email or password."}), 401

    token = jwt.encode(
        {
            "user_id": user.id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=current_app.config["JWT_EXPIRY"])
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return jsonify({"message": "Login successful.", "token": token, "user": user.to_dict()}), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    # JWT is stateless so logout is handled on the frontend by discarding the token
    return jsonify({"message": "Logged out successfully."}), 200