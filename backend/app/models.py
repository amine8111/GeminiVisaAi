from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    mobile = db.Column(db.String(20), unique=True, index=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    profile = db.relationship("Profile", backref="user", uselist=False, lazy=True)
    applications = db.relationship("VisaApplication", backref="user", lazy=True)
    documents = db.relationship("DocumentMetadata", backref="user", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "mobile": self.mobile,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Profile(db.Model):
    __tablename__ = "profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False
    )

    first_name = db.Column(db.String(50), nullable=True)
    middle_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    date_of_birth = db.Column(db.Date, nullable=True)
    place_of_birth = db.Column(db.String(100), nullable=True)

    passport_number = db.Column(db.String(50), nullable=True)
    passport_issue_country = db.Column(db.String(100), nullable=True)
    passport_issue_date = db.Column(db.Date, nullable=True)
    passport_expiry_date = db.Column(db.Date, nullable=True)

    employment_status = db.Column(db.String(50), nullable=True)
    company_name = db.Column(db.String(100), nullable=True)
    job_title = db.Column(db.String(100), nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    monthly_income = db.Column(db.Float, nullable=True)

    bank_balance_avg_6m = db.Column(db.Float, nullable=True)
    has_property = db.Column(db.Boolean, default=False)
    has_dependents = db.Column(db.Integer, default=0)

    prior_international_travel = db.Column(db.Boolean, default=False)
    prior_schengen_visa = db.Column(db.Boolean, default=False)
    prior_us_uk_canada_visa = db.Column(db.Boolean, default=False)
    ever_refused_visa = db.Column(db.Boolean, default=False)
    refusal_details = db.Column(db.Text, nullable=True)
    passport_photo = db.Column(db.Text, nullable=True)
    marital_status = db.Column(db.String(50), nullable=True)
    nationality = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "first_name": self.first_name,
            "middle_name": self.middle_name,
            "last_name": self.last_name,
            "date_of_birth": self.date_of_birth.isoformat()
            if self.date_of_birth
            else None,
            "place_of_birth": self.place_of_birth,
            "passport_number": self.passport_number,
            "passport_issue_country": self.passport_issue_country,
            "passport_issue_date": self.passport_issue_date.isoformat()
            if self.passport_issue_date
            else None,
            "passport_expiry_date": self.passport_expiry_date.isoformat()
            if self.passport_expiry_date
            else None,
            "employment_status": self.employment_status,
            "company_name": self.company_name,
            "job_title": self.job_title,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "monthly_income": self.monthly_income,
            "bank_balance_avg_6m": self.bank_balance_avg_6m,
            "has_property": self.has_property,
            "has_dependents": self.has_dependents,
            "prior_international_travel": self.prior_international_travel,
            "prior_schengen_visa": self.prior_schengen_visa,
            "prior_us_uk_canada_visa": self.prior_us_uk_canada_visa,
            "ever_refused_visa": self.ever_refused_visa,
            "refusal_details": self.refusal_details,
            "passport_photo": self.passport_photo,
            "marital_status": self.marital_status,
            "nationality": self.nationality,
        }


class VisaApplication(db.Model):
    __tablename__ = "visa_applications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    destination_country = db.Column(db.String(100), nullable=False)
    purpose_of_travel = db.Column(db.String(100), nullable=False)
    intended_travel_start = db.Column(db.Date, nullable=False)
    intended_travel_end = db.Column(db.Date, nullable=False)
    estimated_trip_cost = db.Column(db.Float, nullable=False)

    application_status = db.Column(db.String(50), default="Draft")
    success_probability = db.Column(db.Integer, nullable=True)
    advice_given = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    documents = db.relationship("DocumentMetadata", backref="application", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "destination_country": self.destination_country,
            "purpose_of_travel": self.purpose_of_travel,
            "intended_travel_start": self.intended_travel_start.isoformat()
            if self.intended_travel_start
            else None,
            "intended_travel_end": self.intended_travel_end.isoformat()
            if self.intended_travel_end
            else None,
            "estimated_trip_cost": self.estimated_trip_cost,
            "application_status": self.application_status,
            "success_probability": self.success_probability,
            "advice_given": self.advice_given,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class DocumentMetadata(db.Model):
    __tablename__ = "document_metadata"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    application_id = db.Column(
        db.Integer, db.ForeignKey("visa_applications.id"), nullable=True
    )
    document_type = db.Column(db.String(50), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "application_id": self.application_id,
            "document_type": self.document_type,
            "file_name": self.file_name,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
        }
