from random import randint
import requests

from django.template.loader import render_to_string
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.contrib.sites.models import Site
from django.core.cache import cache

from users.utils import exclude_curr_user_and_disliked
from users.serializers import UserRecommendSystemSerializer


def compute_user_text_recommends(user_id: int):
    user = get_user_model()
    curr_user = user.objects.get(id=user_id)
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
    curr_user.recommends.set(text_response)
    return


def send_activate_email_message(user_id):
    user = get_object_or_404(get_user_model(), id=user_id)
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))

    subject = f'Активируйте свой аккаунт, {user.username}!'
    current_site = Site.objects.get_current().domain
    current_scheme = settings.CURRENT_SCHEME
    confirm_email_url = settings.FRONTEND_EMAIL_CONFIRM_URL
    activation_url = f'{confirm_email_url}?uidb64={uid}&token={token}'

    message = render_to_string('email/activate_email_send.html', {
        'user': user,
        'activation_url': f'{current_scheme}{current_site}{activation_url}',
    })
    return user.email_user(subject, message)


def send_login_email_message(user_id):
    code = str(randint(1000, 9999))
    cache.set(f'login_code_{user_id}', code, timeout=300)

    user = get_object_or_404(get_user_model(), id=user_id)
    subject = f'Login Code'
    message = render_to_string('email/login_email_send.html', {
        'code': code,
    })
    return user.email_user(subject, message)


def send_password_reset_message(user_id: int):
    user = get_object_or_404(get_user_model(), id=user_id)
    uid = urlsafe_base64_encode(force_bytes(user.id))
    token = default_token_generator.make_token(user)

    subject = f'Reset password'
    current_site = Site.objects.get_current().domain
    current_scheme = settings.CURRENT_SCHEME
    password_reset_url = settings.FRONTEND_PASSWORD_RESET_URL
    reset_url = f'{current_site}{password_reset_url}?uidb64={uid}&token={token}'

    cache.set(f'password_reset_code_{user_id}', token, timeout=300)

    message = render_to_string('email/password_reset_email_send.html', {
        'activation_url': f'{current_scheme}{reset_url}',
    })
    return user.email_user(subject, message)
