from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from io import BytesIO
from datetime import datetime


def generate_schengen_form_pdf(user_profile, application_data):
    """
    Generate a pre-filled Schengen visa application form PDF.
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 16)
    c.drawString(20 * mm, height - 20 * mm, "Schengen Visa Application Form")

    c.setFont("Helvetica", 10)
    y = height - 35 * mm

    c.setFont("Helvetica-Bold", 12)
    c.drawString(20 * mm, y, "Section A: Personal Information")
    y -= 8 * mm

    c.setFont("Helvetica", 10)

    first_name = user_profile.get("first_name", "") or ""
    middle_name = user_profile.get("middle_name", "") or ""
    last_name = user_profile.get("last_name", "") or ""
    c.drawString(20 * mm, y, f"Surname: {last_name}")
    y -= 5 * mm
    c.drawString(20 * mm, y, f"Given Name(s): {first_name} {middle_name}")
    y -= 5 * mm

    dob = user_profile.get("date_of_birth", "")
    if dob:
        try:
            if isinstance(dob, str):
                dt = datetime.strptime(dob, "%Y-%m-%d")
                dob = dt.strftime("%d/%m/%Y")
        except:
            pass
    c.drawString(20 * mm, y, f"Date of Birth: {dob}")
    y -= 5 * mm

    pob = user_profile.get("place_of_birth", "") or ""
    c.drawString(20 * mm, y, f"Place of Birth: {pob}")
    y -= 5 * mm

    c.drawString(20 * mm, y, f"Nationality: {user_profile.get('nationality', 'N/A')}")
    y -= 10 * mm

    c.setFont("Helvetica-Bold", 12)
    c.drawString(20 * mm, y, "Section B: Passport Information")
    y -= 8 * mm

    c.setFont("Helvetica", 10)
    c.drawString(
        20 * mm, y, f"Passport Number: {user_profile.get('passport_number', 'N/A')}"
    )
    y -= 5 * mm

    issue_country = user_profile.get("passport_issue_country", "") or ""
    c.drawString(20 * mm, y, f"Issue Country: {issue_country}")
    y -= 5 * mm

    issue_date = user_profile.get("passport_issue_date", "")
    if issue_date:
        try:
            if isinstance(issue_date, str):
                dt = datetime.strptime(issue_date, "%Y-%m-%d")
                issue_date = dt.strftime("%d/%m/%Y")
        except:
            pass
    c.drawString(20 * mm, y, f"Issue Date: {issue_date}")
    y -= 5 * mm

    expiry_date = user_profile.get("passport_expiry_date", "")
    if expiry_date:
        try:
            if isinstance(expiry_date, str):
                dt = datetime.strptime(expiry_date, "%Y-%m-%d")
                expiry_date = dt.strftime("%d/%m/%Y")
        except:
            pass
    c.drawString(20 * mm, y, f"Expiry Date: {expiry_date}")
    y -= 10 * mm

    c.setFont("Helvetica-Bold", 12)
    c.drawString(20 * mm, y, "Section C: Travel Information")
    y -= 8 * mm

    c.setFont("Helvetica", 10)
    destination = application_data.get("destination_country", "N/A")
    c.drawString(20 * mm, y, f"Destination Country: {destination}")
    y -= 5 * mm

    purpose = application_data.get("purpose_of_travel", "N/A")
    c.drawString(20 * mm, y, f"Purpose of Travel: {purpose}")
    y -= 5 * mm

    travel_start = application_data.get("intended_travel_start", "")
    if travel_start:
        try:
            if isinstance(travel_start, str):
                dt = datetime.strptime(travel_start, "%Y-%m-%d")
                travel_start = dt.strftime("%d/%m/%Y")
        except:
            pass
    c.drawString(20 * mm, y, f"Intended Travel Start: {travel_start}")
    y -= 5 * mm

    travel_end = application_data.get("intended_travel_end", "")
    if travel_end:
        try:
            if isinstance(travel_end, str):
                dt = datetime.strptime(travel_end, "%Y-%m-%d")
                travel_end = dt.strftime("%d/%m/%Y")
        except:
            pass
    c.drawString(20 * mm, y, f"Intended Travel End: {travel_end}")
    y -= 5 * mm

    cost = application_data.get("estimated_trip_cost", 0)
    c.drawString(20 * mm, y, f"Estimated Trip Cost: ${cost:,.2f}")
    y -= 15 * mm

    c.setFont("Helvetica-Bold", 10)
    c.drawString(
        20 * mm,
        y,
        "Declaration: I declare that the information provided is accurate and true.",
    )
    y -= 10 * mm

    c.setFont("Helvetica", 9)
    c.drawString(20 * mm, y, f"Date: {datetime.now().strftime('%d/%m/%Y')}")
    y -= 10 * mm

    c.drawString(20 * mm, y, "Signature: _______________________")

    c.showPage()
    c.save()

    buffer.seek(0)
    return buffer
