from flask import Blueprint, request, jsonify, send_file
from app import db
from app.models import User, Profile, VisaApplication, DocumentMetadata
from app.services.ai_eligibility import calculate_eligibility
from app.services.form_filler import generate_schengen_form_pdf
from app.services.email_service import send_milestone_reminder
import jwt
from datetime import datetime, timedelta
from functools import wraps
from config import Config

bp = Blueprint("routes", __name__)


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"message": "Token is missing"}), 401

        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.filter_by(id=data["user_id"]).first()
            if not current_user:
                return jsonify({"message": "User not found"}), 401
        except:
            return jsonify({"message": "Token is invalid"}), 401

        return f(current_user, *args, **kwargs)

    return decorated


@bp.route("/", methods=["GET"])
def health_check():
    return jsonify(
        {"status": "healthy", "message": "GeminiVisaAI Backend Running"}
    ), 200


@bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data or not data.get("mobile") or not data.get("password"):
        return jsonify({"message": "Mobile and password are required"}), 400

    if User.query.filter_by(mobile=data["mobile"]).first():
        return jsonify({"message": "User already exists"}), 409

    user = User(mobile=data["mobile"], email=data.get("email"))
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    profile = Profile(
        user_id=user.id,
        first_name=data.get("firstName", ""),
        last_name=data.get("lastName", ""),
        date_of_birth=datetime.strptime(data["dateOfBirth"], "%Y-%m-%d").date()
        if data.get("dateOfBirth")
        else None,
        place_of_birth=data.get("placeOfBirth", ""),
    )
    db.session.add(profile)
    db.session.commit()

    token = jwt.encode(
        {"user_id": user.id, "exp": datetime.utcnow() + timedelta(days=7)},
        Config.SECRET_KEY,
        algorithm="HS256",
    )

    return jsonify({"token": token, "user": user.to_dict()}), 201


@bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data or not data.get("mobile") or not data.get("password"):
        return jsonify({"message": "Mobile and password are required"}), 400

    user = User.query.filter_by(mobile=data["mobile"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"message": "Invalid credentials"}), 401

    token = jwt.encode(
        {"user_id": user.id, "exp": datetime.utcnow() + timedelta(days=7)},
        Config.SECRET_KEY,
        algorithm="HS256",
    )

    return jsonify({"token": token, "user": user.to_dict()}), 200


@bp.route("/api/user/profile", methods=["GET"])
@token_required
def get_profile(current_user):
    profile = Profile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        return jsonify({"message": "Profile not found"}), 404
    return jsonify(profile.to_dict()), 200


@bp.route("/api/user/profile", methods=["PUT"])
@token_required
def update_profile(current_user):
    profile = Profile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.session.add(profile)

    data = request.get_json()

    profile.first_name = data.get("first_name", profile.first_name)
    profile.middle_name = data.get("middle_name", profile.middle_name)
    profile.last_name = data.get("last_name", profile.last_name)

    if data.get("date_of_birth"):
        profile.date_of_birth = datetime.strptime(
            data["date_of_birth"], "%Y-%m-%d"
        ).date()
    profile.place_of_birth = data.get("place_of_birth", profile.place_of_birth)

    profile.passport_number = data.get("passport_number", profile.passport_number)
    profile.passport_issue_country = data.get(
        "passport_issue_country", profile.passport_issue_country
    )

    if data.get("passport_issue_date"):
        profile.passport_issue_date = datetime.strptime(
            data["passport_issue_date"], "%Y-%m-%d"
        ).date()
    if data.get("passport_expiry_date"):
        profile.passport_expiry_date = datetime.strptime(
            data["passport_expiry_date"], "%Y-%m-%d"
        ).date()

    profile.employment_status = data.get("employment_status", profile.employment_status)
    profile.company_name = data.get("company_name", profile.company_name)
    profile.job_title = data.get("job_title", profile.job_title)

    if data.get("start_date"):
        profile.start_date = datetime.strptime(data["start_date"], "%Y-%m-%d").date()

    profile.monthly_income = data.get("monthly_income", profile.monthly_income)
    profile.bank_balance_avg_6m = data.get(
        "bank_balance_avg_6m", profile.bank_balance_avg_6m
    )
    profile.has_property = data.get("has_property", profile.has_property)
    profile.has_dependents = data.get("has_dependents", profile.has_dependents)

    profile.prior_international_travel = data.get(
        "prior_international_travel", profile.prior_international_travel
    )
    profile.prior_schengen_visa = data.get(
        "prior_schengen_visa", profile.prior_schengen_visa
    )
    profile.prior_us_uk_canada_visa = data.get(
        "prior_us_uk_canada_visa", profile.prior_us_uk_canada_visa
    )
    profile.ever_refused_visa = data.get("ever_refused_visa", profile.ever_refused_visa)
    profile.refusal_details = data.get("refusal_details", profile.refusal_details)

    db.session.commit()
    return jsonify(profile.to_dict()), 200


@bp.route("/api/applications", methods=["POST"])
@token_required
def create_application(current_user):
    data = request.get_json()

    if not data.get("destination_country") or not data.get("purpose_of_travel"):
        return jsonify({"message": "Destination and purpose are required"}), 400

    application = VisaApplication(
        user_id=current_user.id,
        destination_country=data["destination_country"],
        purpose_of_travel=data["purpose_of_travel"],
        intended_travel_start=datetime.strptime(
            data["intended_travel_start"], "%Y-%m-%d"
        ).date(),
        intended_travel_end=datetime.strptime(
            data["intended_travel_end"], "%Y-%m-%d"
        ).date(),
        estimated_trip_cost=data["estimated_trip_cost"],
        application_status="Draft",
    )
    db.session.add(application)
    db.session.commit()

    return jsonify(application.to_dict()), 201


@bp.route("/api/applications", methods=["GET"])
@token_required
def get_applications(current_user):
    applications = (
        VisaApplication.query.filter_by(user_id=current_user.id)
        .order_by(VisaApplication.created_at.desc())
        .all()
    )
    return jsonify([app.to_dict() for app in applications]), 200


@bp.route("/api/applications/<int:app_id>/eligibility", methods=["GET"])
@token_required
def check_eligibility(current_user, app_id):
    application = VisaApplication.query.filter_by(
        id=app_id, user_id=current_user.id
    ).first()
    if not application:
        return jsonify({"message": "Application not found"}), 404

    profile = Profile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        return jsonify({"message": "Profile not found"}), 404

    profile_dict = profile.to_dict()
    application_dict = application.to_dict()

    result = calculate_eligibility(profile_dict, application_dict)

    application.success_probability = result["probability"]
    application.advice_given = "\n".join(result["advice"])
    db.session.commit()

    return jsonify(result), 200


@bp.route("/api/documents", methods=["GET"])
@token_required
def get_documents(current_user):
    documents = (
        DocumentMetadata.query.filter_by(user_id=current_user.id)
        .order_by(DocumentMetadata.uploaded_at.desc())
        .all()
    )
    return jsonify([doc.to_dict() for doc in documents]), 200


@bp.route("/api/documents/upload", methods=["POST"])
@token_required
def upload_document(current_user):
    data = request.get_json()

    if not data.get("document_type") or not data.get("file_name"):
        return jsonify({"message": "Document type and file name are required"}), 400

    document = DocumentMetadata(
        user_id=current_user.id,
        application_id=data.get("application_id"),
        document_type=data["document_type"],
        file_name=data["file_name"],
    )
    db.session.add(document)
    db.session.commit()

    return jsonify(document.to_dict()), 201


@bp.route("/api/generate-schengen-form/<int:app_id>", methods=["GET"])
@token_required
def generate_schengen_form(current_user, app_id):
    application = VisaApplication.query.filter_by(
        id=app_id, user_id=current_user.id
    ).first()
    if not application:
        return jsonify({"message": "Application not found"}), 404

    profile = Profile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        return jsonify({"message": "Profile not found"}), 404

    pdf_buffer = generate_schengen_form_pdf(profile.to_dict(), application.to_dict())

    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"schengen_visa_form_{application.id}.pdf",
    )


@bp.route("/api/send-milestone-reminder", methods=["POST"])
@token_required
def send_reminder(current_user):
    data = request.get_json()

    if not data.get("milestone_action") or not data.get("due_date"):
        return jsonify({"message": "Milestone action and due date are required"}), 400

    success = send_milestone_reminder(
        current_user, data["milestone_action"], data["due_date"]
    )

    if success:
        return jsonify({"message": "Reminder sent successfully"}), 200
    return jsonify({"message": "Failed to send reminder"}), 500
