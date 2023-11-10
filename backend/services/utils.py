import requests
from django.conf import settings


def check_recaptcha(captcha_token):
    params = settings.RECAPTCHA_PARAMS
    params['response'] = captcha_token
    verification_response = requests.post(
        settings.RECAPTCHA_URL,
        data=params
    )
    try:
        verification_data = verification_response.json()
    except ValueError:
        return False
    if verification_data.get('success'):
        return True
    else:
        return False
