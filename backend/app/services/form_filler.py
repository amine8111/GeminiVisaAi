from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from io import BytesIO
from datetime import datetime


def generate_schengen_form_pdf(user_profile, application_data):
    """
    Generate a realistic Schengen visa application form PDF.
    Following the official Schengen visa application form layout.
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Colors
    dark_blue = colors.Color(0, 0.1, 0.3)
    light_gray = colors.Color(0.95, 0.95, 0.95)

    # Header
    c.setFillColor(dark_blue)
    c.rect(0, height - 40 * mm, width, 40 * mm, fill=True, stroke=False)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(20 * mm, height - 25 * mm, "SCHENGEN VISA APPLICATION FORM")

    c.setFont("Helvetica", 10)
    c.drawString(
        20 * mm, height - 32 * mm, "Application for Schengen Visa - Type D/Type C"
    )

    # Flags/emblem placeholder
    c.setFillColor(colors.white)
    c.circle(width - 25 * mm, height - 20 * mm, 8 * mm, fill=True, stroke=False)

    y = height - 50 * mm

    # Section 1: Personal Information
    c.setFillColor(dark_blue)
    c.rect(15 * mm, y - 3 * mm, width - 30 * mm, 8 * mm, fill=True, stroke=False)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(20 * mm, y - 2 * mm, "SECTION A: PERSONAL INFORMATION")

    y -= 12 * mm

    c.setFillColor(colors.black)
    c.setFont("Helvetica", 9)

    # Name fields
    c.drawString(20 * mm, y, "Surname (Family Name):")
    c.setFont("Helvetica-Bold", 9)
    c.drawString(
        60 * mm, y, user_profile.get("last_name", "").upper() or "_______________"
    )

    c.setFont("Helvetica", 9)
    c.drawString(120 * mm, y, "Surname at birth (if different):")
    c.drawString(170 * mm, y, "_______________")

    y -= 8 * mm

    c.setFont("Helvetica", 9)
    c.drawString(20 * mm, y, "Given Name(s) (First Name):")
    c.setFont("Helvetica-Bold", 9)
    first_name = user_profile.get("first_name", "") or ""
    middle_name = user_profile.get("middle_name", "") or ""
    c.drawString(60 * mm, y, f"{first_name} {middle_name}".strip() or "_______________")

    y -= 8 * mm

    c.setFont("Helvetica", 9)
    c.drawString(20 * mm, y, "Date of Birth:")
    dob = user_profile.get("date_of_birth", "")
    if dob:
        try:
            dt = datetime.strptime(dob, "%Y-%m-%d")
            dob = dt.strftime("%d/%m/%Y")
        except:
            pass
    c.drawString(55 * mm, y, dob or "____/____/____")

    c.drawString(80 * mm, y, "Place of Birth:")
    c.drawString(
        115 * mm, y, user_profile.get("place_of_birth", "") or "_______________"
    )

    c.drawString(160 * mm, y, "Country:")
    c.drawString(
        180 * mm, y, user_profile.get("passport_issue_country", "") or "_______________"
    )

    y -= 8 * mm

    c.setFont("Helvetica", 9)
    c.drawString(20 * mm, y, "Sex:")
    c.drawString(40 * mm, y, "☐ Male  ☐ Female")

    c.drawString(80 * mm, y, "Marital Status:")
    c.drawString(120 * mm, y, "☐ Single  ☐ Married  ☐ Divorced  ☐ Widowed")

    y -= 10 * mm

    # Section 2: Travel Document
    c.setFillColor(dark_blue)
    c.rect(15 * mm, y - 3 * mm, width - 30 * mm, 8 * mm, fill=True, stroke=False)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(20 * mm, y - 2 * mm, "SECTION B: TRAVEL DOCUMENT INFORMATION")

    y -= 12 * mm

    c.setFillColor(colors.black)
    c.setFont("Helvetica", 9)
    c.drawString(20 * mm, y, "Travel Document Type:")
    c.drawString(
        65 * mm, y, "☐ Ordinary Passport  ☐ Diplomatic Passport  ☐ Service Passport"
    )

    y -= 8 * mm

    c.drawString(20 * mm, y, "Passport Number:")
    c.drawString(
        55 * mm, y, user_profile.get("passport_number", "") or "_______________"
    )

    c.drawString(100 * mm, y, "Issue Date:")
    issue_date = user_profile.get("passport_issue_date", "")
    if issue_date:
        try:
            dt = datetime.strptime(issue_date, "%Y-%m-%d")
            issue_date = dt.strftime("%d/%m/%Y")
        except:
            pass
    c.drawString(130 * mm, y, issue_date or "____/____/____")

    c.drawString(165 * mm, y, "Expiry Date:")
    expiry = user_profile.get("passport_expiry_date", "")
    if expiry:
        try:
            dt = datetime.strptime(expiry, "%Y-%m-%d")
            expiry = dt.strftime("%d/%m/%Y")
        except:
            pass
    c.drawString(190 * mm, y, expiry or "____/____/____")

    y -= 8 * mm

    c.drawString(20 * mm, y, "Issued by:")
    c.drawString(
        55 * mm, y, user_profile.get("passport_issue_country", "") or "_______________"
    )

    y -= 10 * mm

    # Section 3: Visa Information
    c.setFillColor(dark_blue)
    c.rect(15 * mm, y - 3 * mm, width - 30 * mm, 8 * mm, fill=True, stroke=False)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(20 * mm, y - 2 * mm, "SECTION C: VISA INFORMATION")

    y -= 12 * mm

    c.setFillColor(colors.black)
    c.setFont("Helvetica", 9)
    c.drawString(20 * mm, y, "Purpose of Travel:")
    c.drawString(
        60 * mm,
        y,
        application_data.get("purpose_of_travel", "").upper() or "_______________",
    )

    y -= 8 * mm

    c.drawString(20 * mm, y, "Number of Entries:")
    c.drawString(60 * mm, y, "☐ Single  ☐ Two  ☐ Multiple")

    y -= 8 * mm

    c.drawString(20 * mm, y, "Intended Date of Arrival:")
    start = application_data.get("intended_travel_start", "")
    if start:
        try:
            dt = datetime.strptime(start, "%Y-%m-%d")
            start = dt.strftime("%d/%m/%Y")
        except:
            pass
    c.drawString(75 * mm, y, start or "____/____/____")

    c.drawString(120 * mm, y, "Intended Date of Departure:")
    end = application_data.get("intended_travel_end", "")
    if end:
        try:
            dt = datetime.strptime(end, "%Y-%m-%d")
            end = dt.strftime("%d/%m/%Y")
        except:
            pass
    c.drawString(175 * mm, y, end or "____/____/____")

    y -= 8 * mm

    c.drawString(20 * mm, y, "Main Destination (Country):")
    c.drawString(
        80 * mm,
        y,
        application_data.get("destination_country", "").upper() or "_______________",
    )

    y -= 8 * mm

    c.drawString(20 * mm, y, "Country of First Entry:")
    c.drawString(
        70 * mm,
        y,
        application_data.get("destination_country", "").upper() or "_______________",
    )

    y -= 10 * mm

    # Section 4: Financial Means
    c.setFillColor(dark_blue)
    c.rect(15 * mm, y - 3 * mm, width - 30 * mm, 8 * mm, fill=True, stroke=False)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(20 * mm, y - 2 * mm, "SECTION D: FINANCIAL MEANS")

    y -= 12 * mm

    c.setFillColor(colors.black)
    c.setFont("Helvetica", 9)
    c.drawString(20 * mm, y, "Means of Subsistence:")
    c.drawString(65 * mm, y, "☐ Cash  ☐ Credit Cards  ☐ Traveller's Cheques  ☐ Other")

    y -= 8 * mm

    c.drawString(20 * mm, y, "Monthly Income/Available Funds:")
    income = user_profile.get("monthly_income", 0) or 0
    c.drawString(85 * mm, y, f"€ {income * 0.92:.2f} (converted from {income})")

    c.drawString(145 * mm, y, "Bank Balance:")
    balance = user_profile.get("bank_balance_avg_6m", 0) or 0
    c.drawString(180 * mm, y, f"€ {balance * 0.92:.2f}")

    y -= 10 * mm

    # Section 5: Accommodation
    c.setFillColor(dark_blue)
    c.rect(15 * mm, y - 3 * mm, width - 30 * mm, 8 * mm, fill=True, stroke=False)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(20 * mm, y - 2 * mm, "SECTION E: ACCOMMODATION")

    y -= 12 * mm

    c.setFillColor(colors.black)
    c.setFont("Helvetica", 9)
    c.drawString(20 * mm, y, "Type of Accommodation:")
    c.drawString(70 * mm, y, "☐ Hotel  ☐ Rental  ☐ Private  ☐ Other")

    y -= 8 * mm

    c.drawString(20 * mm, y, "Address:")
    c.drawString(50 * mm, y, "To be provided upon confirmation")

    y -= 15 * mm

    # Declaration
    c.setFillColor(light_gray)
    c.rect(15 * mm, y - 30 * mm, width - 30 * mm, 35 * mm, fill=True, stroke=False)

    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(20 * mm, y - 5 * mm, "DECLARATION")

    c.setFont("Helvetica", 8)
    c.drawString(
        20 * mm,
        y - 12 * mm,
        "I declare that the information provided in this application is accurate and complete.",
    )
    c.drawString(
        20 * mm,
        y - 18 * mm,
        "I am aware that any false or incomplete information may lead to the rejection of my application.",
    )
    c.drawString(
        20 * mm,
        y - 24 * mm,
        "I consent to the processing of my personal data for the purposes of this visa application.",
    )

    y -= 40 * mm

    c.setFont("Helvetica", 9)
    c.drawString(20 * mm, y, "Date:")
    c.drawString(40 * mm, y, datetime.now().strftime("%d/%m/%Y"))

    c.drawString(100 * mm, y, "Signature:")
    c.line(130 * mm, y, 180 * mm, y)

    c.setFont("Helvetica-Bold", 10)
    c.drawString(20 * mm, y - 15 * mm, "VISA GPT - AI-ASSISTED PREPARATION")
    c.setFont("Helvetica", 8)
    c.drawString(
        20 * mm,
        y - 22 * mm,
        "This document was prepared using AI-assisted visa eligibility analysis",
    )
    c.drawString(
        20 * mm,
        y - 28 * mm,
        f"Application ID: {application_data.get('id', 'N/A')} | Probability Score: {application_data.get('success_probability', 'N/A')}%",
    )

    # Footer
    c.setFillColor(colors.gray)
    c.setFont("Helvetica", 7)
    c.drawString(
        20 * mm,
        10 * mm,
        "This form is for application preparation purposes only. Submit official forms to the relevant consulate.",
    )
    c.drawString(
        20 * mm,
        6 * mm,
        f"Generated by VisaGpt on {datetime.now().strftime('%Y-%m-%d %H:%M')}",
    )

    c.showPage()
    c.save()

    buffer.seek(0)
    return buffer
