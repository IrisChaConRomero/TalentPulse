from django.db import models
from django.contrib.auth.models import AbstractUser

class RoleChoices(models.TextChoices):
    ADMIN = 'ADMIN', 'Administrador'
    MANAGER = 'MANAGER', 'Manager / Supervisor'
    EMPLOYEE = 'EMPLOYEE', 'Empleado'

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class CustomUser(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=RoleChoices.choices,
        default=RoleChoices.EMPLOYEE
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members'
    )
    job_title = models.CharField(max_length=100, blank=True, default='Especialista')
    bio = models.TextField(blank=True, default='')
    avatar_url = models.URLField(blank=True, default='')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
