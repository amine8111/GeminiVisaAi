from flask import Flask, request, make_response, jsonify
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

    @app.before_request
    def handle_options():
        if request.method == "OPTIONS":
            response = make_response("", 200)
            origin = request.headers.get("Origin", "")
            if origin.startswith("https://") and (
                "vercel.app" in origin or "localhost" in origin
            ):
                response.headers["Access-Control-Allow-Origin"] = origin
            else:
                response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = (
                "GET, POST, PUT, DELETE, OPTIONS"
            )
            response.headers["Access-Control-Allow-Headers"] = (
                "Content-Type, Authorization"
            )
            response.headers["Access-Control-Max-Age"] = "3600"
            return response

    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get("Origin", "")
        if origin.startswith("https://") and (
            "vercel.app" in origin or "localhost" in origin
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
