import requests
import os

TELEGRAM_BOT_TOKEN = os.environ.get(
    "TELEGRAM_BOT_TOKEN", "8521780664:AAF-mbh2Lz9e3qY2qABMQE3V0KpDv0go9KY"
)
TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"


def send_telegram_message(chat_id, message):
    """Send a message via Telegram bot"""
    try:
        url = f"{TELEGRAM_API_URL}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "HTML",
            "disable_web_page_preview": True,
        }
        response = requests.post(url, json=payload, timeout=10)
        return response.json()
    except Exception as e:
        print(f"Telegram error: {e}")
        return {"ok": False, "error": str(e)}


def send_appointment_alert(chat_id, destination, status="available"):
    """Send appointment availability alert"""
    if status == "available":
        message = f"""
🔔 <b>VisaGpt - Appointment Alert!</b>

🎉 <b>Good News!</b> Appointment slots are now available!

📍 <b>Destination:</b> {destination}

👉 <b>Action Required:</b>
1. Go to VFS/TLS website immediately
2. Book your appointment before slots fill up!
3. Prepare all required documents

⏰ Don't wait - slots go fast!

<i>Sent by VisaGpt • Know Your Visa Chances Before You Apply</i>
"""
    else:
        message = f"""
📋 <b>VisaGpt - Subscription Confirmed</b>

✅ You've subscribed to appointment alerts for:
📍 <b>{destination}</b>

🔔 We'll notify you immediately when slots become available!

<i>Sent by VisaGpt</i>
"""

    return send_telegram_message(chat_id, message)


def set_telegram_webhook():
    """Set webhook for Telegram bot (for receiving updates)"""
    try:
        webhook_url = os.environ.get("TELEGRAM_WEBHOOK_URL", "")
        if webhook_url:
            url = f"{TELEGRAM_API_URL}/setWebhook"
            response = requests.post(url, json={"url": webhook_url}, timeout=10)
            return response.json()
    except Exception as e:
        print(f"Webhook setup error: {e}")
        return {"ok": False, "error": str(e)}


def get_me():
    """Get bot information"""
    try:
        url = f"{TELEGRAM_API_URL}/getMe"
        response = requests.get(url, timeout=10)
        return response.json()
    except Exception as e:
        print(f"GetMe error: {e}")
        return {"ok": False, "error": str(e)}
