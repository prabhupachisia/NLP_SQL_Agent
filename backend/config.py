import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key")
    ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_EXPIRY = int(os.getenv("JWT_EXPIRY", 86400))