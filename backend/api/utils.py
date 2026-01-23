from pywebpush import webpush, WebPushException
from django.conf import settings
from django.core.mail import send_mail
import json
import logging

logger = logging.getLogger(__name__)


def send_email_notification(user, subject, message):
    if not user.email:
        logger.warning(f"User {user.username} has no email address. Skipping email notification.")
        return

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f"Email sent to {user.email}")
    except Exception as e:
        logger.error(f"Failed to send email to {user.email}: {e}")


def send_push_notification(user, message, url=None):
    from .models import PushSubscription

    subscriptions = PushSubscription.objects.filter(user=user)

    payload = {"title": "Play Trade", "body": message, "url": url or "/"}

    vapid_private_key = getattr(settings, "VAPID_PRIVATE_KEY", None)
    vapid_claims = getattr(settings, "VAPID_CLAIMS", None)

    if not vapid_private_key:
        logger.warning("VAPID_PRIVATE_KEY not set. Cannot send push notification.")
        return

    for subscription in subscriptions:
        try:
            webpush(
                subscription_info={
                    "endpoint": subscription.endpoint,
                    "keys": {"p256dh": subscription.p256dh, "auth": subscription.auth},
                },
                data=json.dumps(payload),
                vapid_private_key=vapid_private_key,
                vapid_claims=vapid_claims,
            )
        except WebPushException as ex:
            logger.error(f"WebPush failed: {ex}")
            if ex.response and ex.response.status_code == 410:
                subscription.delete()
        except Exception as e:
            logger.error(f"Unexpected error sending push: {e}")
