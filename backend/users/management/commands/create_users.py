import os
import random
import string

from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from django.conf import settings
from django.core.files import File

from services.models import ZodiacSign
from users.models import (
    User,
    UserMedia,
    SEX_CHOICES,
    ORIENTATION_CHOICES,
)


MAX_IMAGES = 5
DEFAULT_IMAGE_PATH = os.path.join('media', 'defaults', 'people')
MAN_IMAGES_PATHS = [
    os.path.join(
        DEFAULT_IMAGE_PATH, "man", f"test_image_{i}.jpg"
    ) for i in range(0, 14)
]
WOMAN_IMAGES_PATHS = [
    os.path.join(
        DEFAULT_IMAGE_PATH, "woman", f"test_image_{i}.jpg"
    ) for i in range(0, 14)
]


def generate_random_username(length=10, min_letters=4):
    """Create a random username with a minimum of min_letters letters"""
    characters = string.ascii_letters + string.digits
    letters = string.ascii_letters

    if min_letters > length:
        raise ValueError("min_letters cannot be greater than length")

    num_letters = random.randint(min_letters, length)
    num_digits = length - num_letters

    random_username = (
        ''.join(random.choice(letters) for _ in range(num_letters)) +
        ''.join(random.choice(characters) for _ in range(num_digits))
    )
    return random_username


class Command(BaseCommand):
    help = 'Creates admins'

    def handle(self, *args, **options):
        admin_user_data = {
            'username': "JMURv",
            'password': make_password('794613825Zx'),
            "age": 21,
            "sex": "m",
            "orientation": "w",
            "height": 180,
            "weight": 50,
            'email': settings.EMAIL_ADMIN,
            "zodiac_sign": ZodiacSign.objects.get(
                pk=random.choice(range(1, 11))
            ),
            "country": "RU",
            "city": "Moscow",
            "is_staff": True,
            "is_superuser": True,
            "is_active": True,
        }
        is_admin = User.objects.filter(
            username=admin_user_data.get('username')
        ).exists()
        if not is_admin:
            admin_user = User.objects.create_superuser(**admin_user_data)
            image_paths = MAN_IMAGES_PATHS
            for image in range(0, MAX_IMAGES):
                with open(random.choice(image_paths), "rb") as user_image:
                    new_user_media = UserMedia(
                        author=admin_user,
                        file=File(
                            user_image
                        )
                    )
                    new_user_media.save()
        else:
            return self.stdout.write(
                self.style.SUCCESS('Users already exist')
            )
        users_list = [
            {
                'username': generate_random_username(),
                'password': make_password('794613825Zx'),
                'email': f"test_email{i}@mail.ru",
                'about': "Lorem ipsum dolor sit amet, consectetur adipiscing "
                         "elit, sed do eiusmod tempor incididunt "
                         "ut labore et dolore magna aliqua. Ut enim ad minim "
                         "veniam, quis nostrud "
                         "exercitation ullamco laboris nisi ut aliquip ex ea "
                         "commodo consequat. "
                         "Duis aute irure dolor in reprehenderit "
                         "in voluptate velit esse cillum dolore eu fugiat "
                         "nulla pariatur.",
                "age": random.randint(18, 45),
                "sex": random.choice(SEX_CHOICES)[0],
                "orientation": random.choice(ORIENTATION_CHOICES)[0],
                "height": random.randint(160, 210),
                "weight": random.randint(45, 100),
                "zodiac_sign": ZodiacSign.objects.get(
                    pk=random.choice(range(1, 11))
                ),
                "country": "RU",
                "city": "Moscow",
                'is_active': True,
            }
            for i in range(1, 101)
        ]
        for user in users_list:
            new_user = User.objects.create(**user)
            new_user.liked.add(admin_user)
            image_paths = MAN_IMAGES_PATHS if new_user.sex == "m"\
                else WOMAN_IMAGES_PATHS
            for image in range(0, MAX_IMAGES):
                with open(random.choice(image_paths), "rb") as user_image:
                    new_user_media = UserMedia(
                        author=new_user,
                        file=File(
                            user_image
                        )
                    )
                    new_user_media.save()
        return self.stdout.write(
            self.style.SUCCESS('Successfully created users')
        )
