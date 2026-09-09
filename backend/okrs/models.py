from django.db import models
from django.conf import settings
from authentication.models import Department

class OKRStatusChoices(models.TextChoices):
    NOT_STARTED = 'NOT_STARTED', 'Sin Iniciar'
    IN_PROGRESS = 'IN_PROGRESS', 'En Progreso'
    COMPLETED = 'COMPLETED', 'Completado'
    AT_RISK = 'AT_RISK', 'En Riesgo'

class OKRGoal(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='okrs'
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='okrs'
    )
    quarter = models.CharField(max_length=20, default='Q3-2026')
    status = models.CharField(
        max_length=20,
        choices=OKRStatusChoices.choices,
        default=OKRStatusChoices.IN_PROGRESS
    )
    progress = models.IntegerField(default=0)  # 0 to 100%
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_progress(self):
        krs = self.key_results.all()
        if not krs.exists():
            return self.progress
        total_weight = sum(kr.weight for kr in krs)
        if total_weight == 0:
            return 0
        weighted_progress = sum(kr.completion_percentage * kr.weight for kr in krs)
        calculated = int(weighted_progress / total_weight)
        self.progress = min(100, max(0, calculated))
        
        # Actualizar estado según progreso
        if self.progress == 100:
            self.status = OKRStatusChoices.COMPLETED
        elif self.progress == 0:
            self.status = OKRStatusChoices.NOT_STARTED
        elif self.progress < 40:
            self.status = OKRStatusChoices.AT_RISK
        else:
            self.status = OKRStatusChoices.IN_PROGRESS
            
        self.save(update_fields=['progress', 'status'])
        return self.progress

    def __str__(self):
        return f"[{self.quarter}] {self.title} ({self.progress}%)"

class KeyResult(models.Model):
    okr = models.ForeignKey(
        OKRGoal,
        on_delete=models.CASCADE,
        related_name='key_results'
    )
    title = models.CharField(max_length=200)
    target_value = models.FloatField(default=100.0)
    current_value = models.FloatField(default=0.0)
    unit = models.CharField(max_length=30, default='%')
    weight = models.FloatField(default=1.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def completion_percentage(self):
        if self.target_value == 0:
            return 100.0 if self.current_value >= 0 else 0.0
        pct = (self.current_value / self.target_value) * 100.0
        return min(100.0, max(0.0, pct))

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.okr.calculate_progress()

    def __str__(self):
        return f"{self.title}: {self.current_value}/{self.target_value} {self.unit}"
