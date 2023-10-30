from celery import shared_task
from .email import (
    send_activate_email_message,
    send_login_email_message,
    compute_user_text_recommends,
    send_password_reset_message
)


@shared_task
def compute_user_text_recommends_task(user_id: int):
    return compute_user_text_recommends(user_id)


@shared_task
def send_activate_email_message_task(user_id: int):
    return send_activate_email_message(user_id)


@shared_task
def send_login_email_message_task(user_id: int):
    return send_login_email_message(user_id)


@shared_task
def send_password_reset_message_task(user_id: int):
    return send_password_reset_message(user_id)
