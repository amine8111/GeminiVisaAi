#!/usr/bin/env python3
"""
Telegram Webhook Setup Script
Run this once after deploying to set up the Telegram bot webhook

Usage:
    python setup_telegram_webhook.py
"""

import requests

TELEGRAM_BOT_TOKEN = "8521780664:AAF-mbh2Lz9e3qY2qABMQE3V0KpDv0go9KY"
BACKEND_URL = "https://geminivisaai.onrender.com"


def main():
    webhook_url = f"{BACKEND_URL}/api/telegram/webhook"

    print(f"Setting up Telegram webhook...")
    print(f"Webhook URL: {webhook_url}")

    # First, check bot info
    print("\n1. Checking bot info...")
    response = requests.get(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getMe")
    bot_info = response.json()

    if bot_info.get("ok"):
        print(f"   Bot: @{bot_info['result']['username']}")
        print(f"   Name: {bot_info['result']['first_name']}")
    else:
        print(f"   Error: {bot_info}")
        return

    # Set webhook
    print("\n2. Setting webhook...")
    response = requests.post(
        f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook",
        json={"url": webhook_url, "drop_pending_updates": True},
    )
    result = response.json()

    if result.get("ok"):
        print(f"   ✅ Webhook set successfully!")
    else:
        print(f"   ❌ Error: {result}")
        return

    # Verify webhook
    print("\n3. Verifying webhook...")
    response = requests.get(
        f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo"
    )
    webhook_info = response.json()

    if webhook_info.get("ok"):
        info = webhook_info["result"]
        print(f"   URL: {info.get('url', 'Not set')}")
        print(f"   Has custom certificate: {info.get('has_custom_certificate', False)}")
        print(f"   Pending updates: {info.get('pending_update_count', 0)}")
        print(f"   Last error: {info.get('last_error_message', 'None')}")

    print("\n✅ Setup complete!")
    print(f"\nNow test the bot:")
    print(f"1. Open Telegram")
    print(f"2. Search for @VisagptAlertBot")
    print(f"3. Send /start")
    print(f"4. You should get a welcome message!")


if __name__ == "__main__":
    main()
