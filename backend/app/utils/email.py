import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import settings


def send_verification_email(to_email: str, token: str):
    """Отправка письма с подтверждением email"""
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

    subject = "Подтверждение email на MathCourse"
    body = f"""
    <html>
    <body>
        <h2>Добро пожаловать на MathCourse!</h2>
        <p>Для подтверждения email перейдите по ссылке:</p>
        <a href="{verification_url}">{verification_url}</a>
    </body>
    </html>
    """

    msg = MIMEMultipart()
    msg['From'] = settings.SMTP_USER
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context) as server:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        print(f"✅ Письмо отправлено на {to_email}")
        return True
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False