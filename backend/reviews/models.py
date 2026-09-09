from django.db import models
from django.conf import settings

class ReviewStatusChoices(models.TextChoices):
    DRAFT = 'DRAFT', 'Borrador'
    SUBMITTED = 'SUBMITTED', 'Enviado para Revisión'
    APPROVED = 'APPROVED', 'Aprobado y Finalizado'

class PerformanceReview(models.Model):
    evaluator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='evaluations_conducted'
    )
    evaluatee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='evaluations_received'
    )
    period = models.CharField(max_length=50, default='Q3 2026')
    leadership_score = models.IntegerField(default=3)  # 1 to 5
    teamwork_score = models.IntegerField(default=4)   # 1 to 5
    technical_score = models.IntegerField(default=4)  # 1 to 5
    overall_score = models.FloatField(default=3.67)
    strengths = models.TextField(blank=True, default='')
    areas_for_improvement = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=20,
        choices=ReviewStatusChoices.choices,
        default=ReviewStatusChoices.SUBMITTED
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        scores = [self.leadership_score, self.teamwork_score, self.technical_score]
        self.overall_score = round(sum(scores) / len(scores), 2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Evaluación {self.period}: {self.evaluatee.username} por {self.evaluator.username} ({self.overall_score}/5.0)"

class Feedback(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feedbacks_sent'
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feedbacks_received'
    )
    content = models.TextField()
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Feedback para {self.receiver.username} ({'Anónimo' if self.is_anonymous else self.sender.username})"
