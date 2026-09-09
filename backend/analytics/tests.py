from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from authentication.models import CustomUser, Department, RoleChoices
from okrs.models import OKRGoal, KeyResult


class AnalyticsAndAITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.dept_eng = Department.objects.create(name="Ingeniería", budget=120000.00)
        self.dept_hr = Department.objects.create(name="RRHH", budget=50000.00)

        self.admin_user = CustomUser.objects.create_user(
            username="admin_cto",
            password="password123",
            role=RoleChoices.ADMIN,
            department=self.dept_eng
        )
        self.manager_user = CustomUser.objects.create_user(
            username="manager_eng",
            password="password123",
            role=RoleChoices.MANAGER,
            department=self.dept_eng
        )
        self.employee_user = CustomUser.objects.create_user(
            username="dev_emp",
            password="password123",
            role=RoleChoices.EMPLOYEE,
            department=self.dept_eng
        )

        self.okr_eng = OKRGoal.objects.create(
            title="Optimizar API Django",
            owner=self.employee_user,
            department=self.dept_eng
        )
        KeyResult.objects.create(
            okr=self.okr_eng,
            title="Reducir latencia P95",
            target_value=100,
            current_value=75,
            unit="ms"
        )

        self.okr_hr = OKRGoal.objects.create(
            title="Plan de Onboarding",
            owner=self.admin_user,
            department=self.dept_hr
        )

    def test_dashboard_role_scopes_and_manager_team(self):
        # Manager ve el alcance DEPARTMENT_MANAGER y su propio equipo
        self.client.force_authenticate(user=self.manager_user)
        res_mgr = self.client.get('/api/analytics/dashboard/')
        self.assertEqual(res_mgr.status_code, status.HTTP_200_OK)
        self.assertEqual(res_mgr.data['role_scope'], 'DEPARTMENT_MANAGER')
        self.assertEqual(res_mgr.data['my_department']['name'], 'Ingeniería')
        self.assertEqual(res_mgr.data['my_department']['member_count'], 3)

        # Admin ve el alcance GLOBAL_ADMIN y presupuesto total
        self.client.force_authenticate(user=self.admin_user)
        res_adm = self.client.get('/api/analytics/dashboard/')
        self.assertEqual(res_adm.status_code, status.HTTP_200_OK)
        self.assertEqual(res_adm.data['role_scope'], 'GLOBAL_ADMIN')
        self.assertEqual(res_adm.data['overview']['total_budget'], 170000.0)

    def test_ai_assistant_for_all_three_roles(self):
        for user, expected_role in [
            (self.admin_user, 'ADMIN'),
            (self.manager_user, 'MANAGER'),
            (self.employee_user, 'EMPLOYEE'),
        ]:
            self.client.force_authenticate(user=user)
            get_res = self.client.get('/api/analytics/ai-assistant/')
            self.assertEqual(get_res.status_code, status.HTTP_200_OK)
            self.assertEqual(get_res.data['role'], expected_role)
            self.assertTrue(len(get_res.data['suggested_prompts']) >= 3)

            post_res = self.client.post(
                '/api/analytics/ai-assistant/',
                {'prompt': '¿Cómo mejorar nuestros OKRs y evitar burnout?'}
            )
            self.assertEqual(post_res.status_code, status.HTTP_200_OK)
            self.assertIn('reply', post_res.data)
            self.assertTrue(len(post_res.data['reply']) > 20)

    def test_ai_okr_generator_endpoint(self):
        self.client.force_authenticate(user=self.employee_user)
        res = self.client.post(
            '/api/analytics/ai-generate-okr/',
            {'goal_idea': 'Mejorar la seguridad cloud y CI/CD'}
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('title', res.data)
        self.assertEqual(len(res.data['key_results']), 3)
