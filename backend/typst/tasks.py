from celery import shared_task
from .email import (
    send_activate_email_code,
    send_login_email_message,
    compute_user_text_recommends,
    send_password_reset_message,
    send_verification_submission_email
)


@shared_task
def send_verification_submission_email_task(user_id, photo_name, photo_data):
    return send_verification_submission_email(user_id, photo_name, photo_data)


@shared_task
def compute_user_text_recommends_task(user_id: int):
    return compute_user_text_recommends(user_id)


@shared_task
def send_activate_email_code_task(target_email: str, key: str):
    return send_activate_email_code(target_email, key)


@shared_task
def send_login_email_message_task(user_id: int):
    return send_login_email_message(user_id)


@shared_task
def send_password_reset_message_task(user_id: int):
    return send_password_reset_message(user_id)
