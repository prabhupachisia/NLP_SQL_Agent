import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

def get_fernet():
    key = os.getenv("ENCRYPTION_KEY")
    if not key:
        raise ValueError("ENCRYPTION_KEY is not set in environment variables.")
    return Fernet(key.encode())

def encrypt(plain_text):
    f = get_fernet()
    return f.encrypt(plain_text.encode()).decode()

def decrypt(encrypted_text):
    f = get_fernet()
    return f.decrypt(encrypted_text.encode()).decode()