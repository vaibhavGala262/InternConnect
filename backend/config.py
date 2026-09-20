from fastapi_mail import ConnectionConfig
import os
import logging
from dotenv import load_dotenv


load_dotenv()

logger = logging.getLogger(__name__)

_mail_required = ("MAIL_USERNAME", "MAIL_PASSWORD", "MAIL_FROM", "MAIL_SERVER")
_mail_missing = [name for name in _mail_required if not os.getenv(name)]
if _mail_missing:
    logger.warning("Email is not configured; missing variables: %s", ", ".join(_mail_missing))


conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", ""),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", ""),
    MAIL_FROM=os.getenv("MAIL_FROM", "noreply@example.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    USE_CREDENTIALS=os.getenv("USE_CREDENTIALS", "True") == "True",
    VALIDATE_CERTS=os.getenv("VALIDATE_CERTS", "True") == "True",
    MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "True") == "True",
    MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS", "False") == "True"
)
