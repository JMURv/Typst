from django.contrib.auth import get_user_model
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()


class UserAPITestCase(APITestCase):
    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'slug': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword',
        }
        self.second_user_data = {
            'username': 'testuser2',
            'slug': 'testuser2',
            'email': 'test2@example.com',
            'password': 'testpassword2',
        }
        self.user = User.objects.create_user(**self.user_data)
        self.second_user = User.objects.create_user(**self.second_user_data)

        self.user_login_url = reverse('login')
        self.user_list_create_url = reverse('user-list-create')
        self.user_subscribe_url = reverse('user-match', kwargs={
            'slug': self.second_user.slug
        })
        self.user_retrieve_update_destroy_url = reverse(
            'user-retrieve-update-destroy', kwargs={
                'slug': self.user.slug
            })

    def test_user_login(self):
        good_login_data = {
            'username': 'testuser',
            'password': 'testpassword',
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
        data = {
            'username': 'newuser',
            'slug': 'newuser',
            'about': 'Lorem ipsum dollar',
            'email': 'newuser@example.com',
            'password': 'newpassword',
        }

        # Test user creation
        response = self.client.post(self.user_list_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Test user listing
        response = self.client.get(self.user_list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_user_subscribe_view(self):
        # Test user subscribe view
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.user_subscribe_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_retrieve_update_destroy_view(self):
        # Test user retrieve view
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.user_retrieve_update_destroy_url)
        old_data = response.data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(old_data.get('username'), "testuser")

        # Test user update view
        data = {
            'username': 'updateduser',
            'email': 'updateduser@example.com',
            'password': 'updatedpassword',
        }
        response = self.client.patch(
            self.user_retrieve_update_destroy_url,
            data
        )
        new_data = response.data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(new_data.get('username'), "updateduser")

        # Test user destroy view
        response = self.client.delete(self.user_retrieve_update_destroy_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
