from rest_framework import viewsets, permissions
from .models import PerformanceReview, Feedback
from .serializers import PerformanceReviewSerializer, FeedbackSerializer
from authentication.permissions import IsOwnerOrManagerOrAdmin, IsManagerOrAdmin

class PerformanceReviewViewSet(viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.all().order_by('-created_at')
    serializer_class = PerformanceReviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrManagerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return PerformanceReview.objects.none()
        if user.role in ['ADMIN', 'MANAGER'] or user.is_superuser:
            return PerformanceReview.objects.all().order_by('-created_at')
        # Empleado normal ve evaluaciones recibidas o realizadas por él
        return (PerformanceReview.objects.filter(
            evaluatee=user
        ) | PerformanceReview.objects.filter(
            evaluator=user
        )).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(evaluator=self.request.user)

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all().order_by('-created_at')
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Feedback.objects.none()
        # Ver feedback recibido o enviado
        return (Feedback.objects.filter(receiver=user) | Feedback.objects.filter(sender=user)).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
