from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
migrate = Migrate()
cors = CORS()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:3000",
                    "https://celebrated-peony-c7923a.netlify.app",
                    "https://*.netlify.app",
                    "https://gemini-visa-ai.vercel.app",
                    "https://*.vercel.app",
                ]
            }
        },
    )

    from app import routes

    app.register_blueprint(routes.bp)

    with app.app_context():
        db.create_all()

    return app
