import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from config import Config


def send_email(to_email, subject, content):
    """
    Send email using SendGrid API.
    """
    api_key = Config.SENDGRID_API_KEY
    from_email = Config.SENDGRID_DEFAULT_FROM_EMAIL

    if not api_key or api_key == "":
        print(f"[SIMULATED EMAIL] To: {to_email}, Subject: {subject}")
        print(f"[SIMULATED EMAIL] Content: {content[:200]}...")
        return True

    try:
        message = Mail(
            from_email=from_email,
            to_emails=to_email,
            subject=subject,
            html_content=content,
        )
        sg = SendGridAPIClient(api_key)
        sg.send(message)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def get_milestone_email_content(user_name, milestone_action, due_date):
    """
    Generate HTML email content for milestone reminders.
    """
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2c3e50;">GeminiVisaAI - Application Update</h2>
        <p>Dear {user_name},</p>
        <p>{milestone_action}</p>
        <p>Due Date: {due_date}</p>
        <p>Log in to your dashboard for more details.</p>
        <hr>
        <p style="color: #7f8c8d; font-size: 12px;">
            This is an automated message from GeminiVisaAI.<br>
            Please do not reply to this email.
        </p>
    </body>
    </html>
    """
    return html_content


def send_milestone_reminder(user, milestone_action, due_date):
    """
    Send milestone reminder email to user.
    """
    user_name = user.profile.first_name if user.profile else "User"
    subject = "GeminiVisaAI - Application Milestone"
    content = get_milestone_email_content(user_name, milestone_action, due_date)

    if user.email:
        return send_email(user.email, subject, content)
    return False
