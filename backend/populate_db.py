import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'talentpulse_core.settings')
django.setup()

from authentication.models import CustomUser, Department, RoleChoices
from okrs.models import OKRGoal, KeyResult, OKRStatusChoices
from reviews.models import PerformanceReview, Feedback, ReviewStatusChoices

def run_seed():
    print("🌱 Poblando base de datos de TalentPulse...")

    # 1. Crear Departamentos
    dept_eng, _ = Department.objects.get_or_create(
        name='Ingeniería & Software',
        defaults={'description': 'Desarrollo de software, sistemas y arquitectura.', 'budget': 150000.00}
    )
    dept_hr, _ = Department.objects.get_or_create(
        name='Recursos Humanos',
        defaults={'description': 'Gestión del talento, cultura y capacitación.', 'budget': 60000.00}
    )
    dept_sales, _ = Department.objects.get_or_create(
        name='Ventas & Marketing',
        defaults={'description': 'Estrategia comercial, crecimiento y alianzas.', 'budget': 90000.00}
    )

    # 2. Crear Usuarios (Admin, Managers, Empleados)
    admin_user, created = CustomUser.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@talentpulse.io',
            'first_name': 'Administrador',
            'last_name': 'Global',
            'role': RoleChoices.ADMIN,
            'department': dept_eng,
            'job_title': 'Director de Tecnología (CTO)',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()

    manager_user, created = CustomUser.objects.get_or_create(
        username='manager_marta',
        defaults={
            'email': 'marta.lorenzo@talentpulse.io',
            'first_name': 'Marta',
            'last_name': 'Lorenzo',
            'role': RoleChoices.MANAGER,
            'department': dept_eng,
            'job_title': 'Engineering Lead / Manager'
        }
    )
    if created:
        manager_user.set_password('manager123')
        manager_user.save()

    emp1, created = CustomUser.objects.get_or_create(
        username='carlos_dev',
        defaults={
            'email': 'carlos.gomez@talentpulse.io',
            'first_name': 'Carlos',
            'last_name': 'Gómez',
            'role': RoleChoices.EMPLOYEE,
            'department': dept_eng,
            'job_title': 'Desarrollador Full Stack Senior'
        }
    )
    if created:
        emp1.set_password('empleado123')
        emp1.save()

    emp2, created = CustomUser.objects.get_or_create(
        username='ana_hr',
        defaults={
            'email': 'ana.martinez@talentpulse.io',
            'first_name': 'Ana',
            'last_name': 'Martínez',
            'role': RoleChoices.EMPLOYEE,
            'department': dept_hr,
            'job_title': 'Especialista en Selección'
        }
    )
    if created:
        emp2.set_password('empleado123')
        emp2.save()

    print("✅ Usuarios y departamentos creados exitosamente.")

    # 3. Crear OKRs y Key Results
    okr1, _ = OKRGoal.objects.get_or_create(
        title='Lanzar la arquitectura V2 de microservicios',
        owner=emp1,
        department=dept_eng,
        defaults={
            'description': 'Migración de la arquitectura monolítica a servicios escalables con Django DRF.',
            'quarter': 'Q3-2026',
            'status': OKRStatusChoices.IN_PROGRESS
        }
    )

    KeyResult.objects.get_or_create(
        okr=okr1,
        title='Cobertura de pruebas unitarias superior al 85%',
        defaults={'target_value': 85.0, 'current_value': 75.0, 'unit': '%', 'weight': 1.0}
    )
    KeyResult.objects.get_or_create(
        okr=okr1,
        title='Reducir el tiempo de respuesta API a menos de 150ms',
        defaults={'target_value': 150.0, 'current_value': 120.0, 'unit': 'ms', 'weight': 1.5}
    )

    okr2, _ = OKRGoal.objects.get_or_create(
        title='Plan de Capacitación Técnica en React y Django',
        owner=manager_user,
        department=dept_eng,
        defaults={
            'description': 'Organizar workshops internos y evaluaciones 360° para todo el equipo.',
            'quarter': 'Q3-2026',
            'status': OKRStatusChoices.COMPLETED
        }
    )

    KeyResult.objects.get_or_create(
        okr=okr2,
        title='Completar 4 talleres prácticos de arquitectura web',
        defaults={'target_value': 4.0, 'current_value': 4.0, 'unit': 'talleres', 'weight': 1.0}
    )

    okr1.calculate_progress()
    okr2.calculate_progress()

    print("✅ OKRs y Key Results creados.")

    # 4. Crear Evaluaciones de Desempeño 360°
    rev1, _ = PerformanceReview.objects.get_or_create(
        evaluator=manager_user,
        evaluatee=emp1,
        period='Anual 2026',
        defaults={
            'leadership_score': 4,
            'teamwork_score': 5,
            'technical_score': 5,
            'strengths': 'Excelente dominio de Python/Django, autonomía técnica y resolución proactiva de bugs.',
            'areas_for_improvement': 'Continuar mejorando la documentación de APIs en Swagger/Postman.',
            'status': ReviewStatusChoices.APPROVED
        }
    )

    rev2, _ = PerformanceReview.objects.get_or_create(
        evaluator=admin_user,
        evaluatee=manager_user,
        period='Anual 2026',
        defaults={
            'leadership_score': 5,
            'teamwork_score': 5,
            'technical_score': 4,
            'strengths': 'Liderazgo inspirador, coordinación eficiente de proyectos y gran capacidad de comunicación.',
            'areas_for_improvement': 'Delegación estratégica en tareas operativas de infraestructura.',
            'status': ReviewStatusChoices.APPROVED
        }
    )

    # 5. Feedback
    Feedback.objects.get_or_create(
        sender=emp1,
        receiver=manager_user,
        defaults={
            'content': 'Muchas gracias Marta por la excelente orientación en el despliegue de la API Django.',
            'is_anonymous': False
        }
    )

    print("✨ Base de datos poblada con éxito.")

if __name__ == '__main__':
    run_seed()
