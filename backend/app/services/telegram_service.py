import requests
import os
import json
from datetime import datetime

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

✅ You've subscribed to appointment alerts!

🔔 We'll notify you immediately when slots become available for <b>{destination}</b>!

<i>Sent by VisaGpt</i>
"""

    return send_telegram_message(chat_id, message)


def send_welcome_message(chat_id, first_name=None):
    """Send welcome message when user starts bot"""
    name = first_name or "there"
    message = f"""
👋 <b>Welcome to VisaGpt Alerts, {name}!</b>

I'm your assistant for visa appointment notifications. Here's what I can do:

🎫 <b>Appointment Alerts</b>
Get instant notifications when VFS/TLS appointment slots open for your destination.

📋 <b>How to use:</b>
1. Open VisaGpt app
2. Go to Services → Appointments
3. Select your destination
4. Enter your Telegram username
5. Subscribe!

You'll receive instant alerts when slots become available!

❓ <b>Need help?</b>
Visit https://visa-ai-one.vercel.app

<i>VisaGpt - Know Your Visa Chances Before You Apply</i>
"""
    return send_telegram_message(chat_id, message)


def send_help_message(chat_id):
    """Send help message"""
    message = """
📚 <b>VisaGpt Bot Help</b>

<b>Commands:</b>
/start - Restart the bot
/help - Show this help message
/status - Check your subscription status

<b>How it works:</b>
1. Subscribe to appointment alerts in the VisaGpt app
2. Make sure you've started this bot
3. Get instant notifications when slots open!

<b>Need more help?</b>
Visit https://visa-ai-one.vercel.app
"""
    return send_telegram_message(chat_id, message)


def parse_telegram_update(update):
    """Parse incoming Telegram update and return relevant info"""
    if "message" in update:
        message = update["message"]
        chat = message.get("chat", {})
        return {
            "chat_id": chat.get("id"),
            "username": chat.get("username"),
            "first_name": chat.get("first_name"),
            "text": message.get("text", ""),
            "type": "message",
        }
    elif "edited_message" in update:
        message = update["edited_message"]
        chat = message.get("chat", {})
        return {
            "chat_id": chat.get("id"),
            "username": chat.get("username"),
            "first_name": chat.get("first_name"),
            "text": message.get("text", ""),
            "type": "edited",
        }
    return None


def process_telegram_command(update):
    """Process incoming Telegram command"""
    parsed = parse_telegram_update(update)
    if not parsed:
        return {"ok": True}

    chat_id = parsed["chat_id"]
    text = parsed["text"].strip().lower()

    if text in ["/start", "start", "hello", "hi"]:
        send_welcome_message(chat_id, parsed.get("first_name"))
        return {"ok": True, "action": "welcome", "chat_id": chat_id}

    elif text in ["/help", "help", "?"]:
        send_help_message(chat_id)
        return {"ok": True, "action": "help"}

    elif text in ["/status", "status"]:
        message = f"""
📊 <b>Your Status</b>

✅ Bot is active and ready!
🔔 You'll receive alerts when you subscribe in the app.

Visit https://visa-ai-one.vercel.app to subscribe.
"""
        send_telegram_message(chat_id, message)
        return {"ok": True, "action": "status"}

    return {"ok": True, "action": "unknown"}


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


def delete_webhook():
    """Delete webhook and return to polling"""
    try:
        url = f"{TELEGRAM_API_URL}/deleteWebhook"
        response = requests.get(url, timeout=10)
        return response.json()
    except Exception as e:
        print(f"Webhook delete error: {e}")
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


def get_updates(offset=None, timeout=0):
    """Get updates from Telegram (for polling)"""
    try:
        url = f"{TELEGRAM_API_URL}/getUpdates"
        params = {"timeout": timeout, "allowed_updates": ["message"]}
        if offset:
            params["offset"] = offset
        response = requests.get(url, params=params, timeout=timeout + 5)
        return response.json()
    except Exception as e:
        print(f"Get updates error: {e}")
        return {"ok": False, "error": str(e)}


def broadcast_to_all(message, chat_ids=None):
    """Broadcast message to all subscribed users"""
    if chat_ids is None:
        return {"sent": 0, "failed": 0}

    sent = 0
    failed = 0

    for chat_id in chat_ids:
        result = send_telegram_message(chat_id, message)
        if result.get("ok"):
            sent += 1
        else:
            failed += 1

    return {"sent": sent, "failed": failed}
