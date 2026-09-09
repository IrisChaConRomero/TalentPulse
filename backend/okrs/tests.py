from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from authentication.models import CustomUser, Department, RoleChoices
from .models import OKRGoal, KeyResult, OKRStatusChoices

class OKRTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.dept = Department.objects.create(name="DevOps")
        self.user = CustomUser.objects.create_user(
            username="devops_lead",
            password="password123",
            role=RoleChoices.EMPLOYEE,
            department=self.dept
        )
        self.okr = OKRGoal.objects.create(
            title="Mejorar uptime a 99.9%",
            owner=self.user,
            department=self.dept,
            quarter="Q3-2026"
        )

    def test_key_result_progress_calculation(self):
        kr = KeyResult.objects.create(
            okr=self.okr,
            title="Reducir caídas de servidor",
            target_value=10.0,
            current_value=5.0,
            weight=1.0
        )
        self.okr.refresh_from_db()
        self.assertEqual(self.okr.progress, 50)
        self.assertEqual(self.okr.status, OKRStatusChoices.IN_PROGRESS)

        kr.current_value = 10.0
        kr.save()
        self.okr.refresh_from_db()
        self.assertEqual(self.okr.progress, 100)
        self.assertEqual(self.okr.status, OKRStatusChoices.COMPLETED)

    def test_okr_list_api(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/okrs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
