from flask import Flask, request, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config

db = SQLAlchemy()
migrate = Migrate()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)

    @app.after_request
    def add_cors_headers(response):
        allowed_origins = [
            "https://visa-ai-one.vercel.app",
            "https://*.vercel.app",
            "http://localhost:5173",
            "http://localhost:3000",
        ]
        origin = request.headers.get("Origin", "")
        if (
            any(
                origin.startswith(o.replace("*", ""))
                for o in allowed_origins
                if "*" in o
            )
            or origin in allowed_origins
        ):
            response.headers["Access-Control-Allow-Origin"] = origin
        else:
            response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = (
            "GET, POST, PUT, DELETE, OPTIONS"
        )
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    from app import routes

    app.register_blueprint(routes.bp)

    with app.app_context():
        db.create_all()

    return app
