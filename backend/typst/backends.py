from django.contrib.auth.backends import ModelBackend, get_user_model
from django.core.exceptions import MultipleObjectsReturned

User = get_user_model()


class EmailBackend(ModelBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return None
        except MultipleObjectsReturned:
            return User.objects.filter(email=email).order_by('id').first()
        else:
            is_password_valid = user.check_password(password)
            is_can_authenticate = self.user_can_authenticate(user)
            if is_password_valid and is_can_authenticate:
                return user

    def get_user(self, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
        return user if self.user_can_authenticate(user) else None
