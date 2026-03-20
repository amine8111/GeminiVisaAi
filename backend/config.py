import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-secret-key-change-in-production"
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or "sqlite:///visaai.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")
    SENDGRID_DEFAULT_FROM_EMAIL = os.environ.get(
        "SENDGRID_DEFAULT_FROM_EMAIL", "noreply@visaai.com"
    )
    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    TELEGRAM_BOT_TOKEN = os.environ.get(
        "TELEGRAM_BOT_TOKEN", "8521780664:AAF-mbh2Lz9e3qY2qABMQE3V0KpDv0go9KY"
    )
    TELEGRAM_WEBHOOK_URL = os.environ.get("TELEGRAM_WEBHOOK_URL", "")
