import base64
from random import randint
import requests

from django.template.loader import render_to_string
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.html import strip_tags
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.contrib.sites.models import Site
from django.core.mail import send_mail, EmailMultiAlternatives
from django.core.cache import cache

from users.utils import exclude_curr_user_and_disliked
from users.serializers import UserRecommendSystemSerializer


def compute_user_text_recommends(user_id: int):
    user = get_user_model()
    curr_user = get_object_or_404(
        klass=user,
        id=user_id
    )

    qs = exclude_curr_user_and_disliked(
        user=curr_user,
        qs=user.objects.all()
    )

    image_response = requests.post(
        url=f"{settings.RECOMMENDATION_URL}/similarity/image/",
        json={
            "user_id": user_id,
            "users": list(qs.values_list('id', flat=True))
        }
    ).json()
    text_response = requests.post(
        url=f"{settings.RECOMMENDATION_URL}/similarity/text/",
        headers={"Content-Type": "application/json"},
        json={
            "current_user": UserRecommendSystemSerializer(curr_user).data,
            "users_list": UserRecommendSystemSerializer(qs, many=True).data
        }
    ).json()
    curr_user.recommends.set(text_response | image_response)
    return


def send_verification_submission_email(user_id, photo_name, photo_data):
    user = get_object_or_404(get_user_model(), id=user_id)
    subject = 'Verification submission'
    email_attachment = base64.b64decode(photo_data)

    domain = Site.objects.get_current().domain
    scheme = settings.CURRENT_SCHEME
    base_url = f'{scheme}{domain}'
    accept_url = f'/admin/verification/accept/{user.id}/'
    decline_url = f'/admin/verification/decline/{user.id}/'

    html_message = render_to_string(
        'email/send_verification_submission_email.html', {
            'accept_url': base_url + accept_url,
            'decline_url': base_url + decline_url
        })
    plain_message = html_message
    email = EmailMultiAlternatives(
        subject=subject,
        body=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[settings.EMAIL_ADMIN]
    )
    email.attach_alternative(html_message, "text/html")
    email.attach(photo_name, email_attachment)
    email.send()


def send_activate_email_code(target_email, key):
    code = str(randint(1000, 9999))
    cache.set(f'activation_code_{key}', code, timeout=300)

    subject = 'E-mail activation code'
    message = render_to_string('email/activate_email_send.html', {
        'code': code,
    })
    return send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[target_email]
    )


def send_login_email_message(user_id):
    code = str(randint(1000, 9999))
    cache.set(f'login_code_{user_id}', code, timeout=300)

    user = get_object_or_404(get_user_model(), id=user_id)
    subject = 'Login Code'
    message = render_to_string('email/login_email_send.html', {
        'code': code,
    })
    return user.email_user(subject, message)


def send_password_reset_message(user_id: int):
    user = get_object_or_404(get_user_model(), id=user_id)
    uid = urlsafe_base64_encode(force_bytes(user.id))
    token = default_token_generator.make_token(user)

    subject = 'Reset password'
    domain = Site.objects.get_current().domain
    scheme = settings.CURRENT_SCHEME
    password_reset_url = settings.FRONTEND_PASSWORD_RESET_URL
    url_params = f"?uidb64={uid}&token={token}"
    reset_url = f'{scheme}{domain}{password_reset_url}{url_params}'

    message = render_to_string('email/password_reset_email_send.html', {
        'activation_url': reset_url,
    })
    cache.set(f'password_reset_code_{user_id}', token, timeout=300)
    return user.email_user(subject, message)
