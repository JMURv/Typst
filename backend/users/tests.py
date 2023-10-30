from django.contrib.auth import get_user_model
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
from rest_framework import status


class UserAPITestCase(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user_data = {
            'id': 1,
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword',
        }
        self.second_user_data = {
            'id': 2,
            'username': 'testuser2',
            'email': 'test2@example.com',
            'password': 'testpassword2',
            'new_like_notification': False,
        }
        self.creation_user_data = {
            'username': 'newuser',
            'about': 'Lorem ipsum dollar',
            'email': 'newuser@example.com',
            'password': 'newpassword',
        }
        self.update_user_data = {
            'username': 'updateduser',
            'email': 'updateduser@example.com',
            'password': 'updatedpassword',
        }

        self.user = user_model.objects.create_user(
            **self.user_data
        )
        self.second_user = user_model.objects.create_user(
            **self.second_user_data
        )

        self.user_login_url = reverse('login')
        self.user_list_create_url = reverse('user-list-create')
        self.user_like_url = reverse('user-like', kwargs={
            'pk': self.second_user.id
        })
        self.user_retrieve_update_destroy_url = reverse(
            'user-retrieve-update-destroy', kwargs={
                'pk': self.user.id
            })

    def test_user_login(self):
        good_login_data = {
            'email': self.user_data.get('email'),
            'password': self.user_data.get('password'),
        }
        response = self.client.post(self.user_login_url, good_login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        bad_login_data = {
            'username': 'notexistingusername',
            'password': 'notexistingpassword',
        }
        response = self.client.post(self.user_login_url, bad_login_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_list_create_view(self):
        # Test user creation
        response = self.client.post(
            self.user_list_create_url,
            self.creation_user_data
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Test user listing
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.user_list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_like_view(self):
        # Test user like view
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.user_like_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_retrieve_update_destroy_view(self):
        # Test user retrieve view
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.user_retrieve_update_destroy_url)
        old_data = response.data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(old_data.get('username'), "testuser")

        # Test user update view
        response = self.client.patch(
            self.user_retrieve_update_destroy_url,
            self.update_user_data
        )
        new_data = response.data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(new_data.get('username'), "updateduser")

        # Test user destroy view
        response = self.client.delete(self.user_retrieve_update_destroy_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
