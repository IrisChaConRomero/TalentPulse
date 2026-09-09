from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import CustomUser, Department, RoleChoices

class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.dept = Department.objects.create(name="QA Testing", budget=50000.00)
        self.admin_user = CustomUser.objects.create_superuser(
            username="admin_test",
            password="password123",
            email="admin@test.com",
            role=RoleChoices.ADMIN,
            department=self.dept
        )
        self.emp_user = CustomUser.objects.create_user(
            username="emp_test",
            password="password123",
            email="emp@test.com",
            role=RoleChoices.EMPLOYEE,
            department=self.dept
        )

    def test_login_success(self):
        url = reverse('api_login')
        response = self.client.post(url, {'username': 'emp_test', 'password': 'password123'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'emp_test')

    def test_login_failure(self):
        url = reverse('api_login')
        response = self.client.post(url, {'username': 'emp_test', 'password': 'wrongpassword'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_current_user(self):
        self.client.force_authenticate(user=self.emp_user)
        url = reverse('api_current_user')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'emp_test')
        self.assertEqual(response.data['role_display'], 'Empleado')
