from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from authentication.models import CustomUser, RoleChoices
from .models import PerformanceReview, ReviewStatusChoices

class PerformanceReviewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.manager = CustomUser.objects.create_user(
            username="manager_test",
            password="password123",
            role=RoleChoices.MANAGER
        )
        self.employee = CustomUser.objects.create_user(
            username="employee_test",
            password="password123",
            role=RoleChoices.EMPLOYEE
        )

    def test_overall_score_calculation(self):
        review = PerformanceReview.objects.create(
            evaluator=self.manager,
            evaluatee=self.employee,
            period="Q3 2026",
            leadership_score=5,
            teamwork_score=4,
            technical_score=3
        )
        self.assertEqual(review.overall_score, 4.0)

    def test_review_api_access(self):
        self.client.force_authenticate(user=self.employee)
        review = PerformanceReview.objects.create(
            evaluator=self.manager,
            evaluatee=self.employee,
            period="Q3 2026",
            leadership_score=4,
            teamwork_score=4,
            technical_score=4
        )
        response = self.client.get('/api/reviews/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_create_feedback_api(self):
        self.client.force_authenticate(user=self.employee)
        payload = {
            'receiver': self.manager.id,
            'content': 'Excelente trabajo en equipo',
            'is_anonymous': False
        }
        response = self.client.post('/api/feedback/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'Excelente trabajo en equipo')
        self.assertEqual(response.data['sender'], self.employee.id)
