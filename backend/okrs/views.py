from rest_framework import viewsets, permissions, filters
from .models import OKRGoal, KeyResult
from .serializers import OKRGoalSerializer, KeyResultSerializer
from authentication.permissions import IsOwnerOrManagerOrAdmin, IsManagerOrAdmin

class OKRGoalViewSet(viewsets.ModelViewSet):
    queryset = OKRGoal.objects.all().order_by('-created_at')
    serializer_class = OKRGoalSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrManagerOrAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'quarter']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return OKRGoal.objects.none()
        if user.role in ['ADMIN', 'MANAGER'] or user.is_superuser:
            return OKRGoal.objects.all().order_by('-created_at')
        # Empleado normal ve sus propios OKRs
        return OKRGoal.objects.filter(owner=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class KeyResultViewSet(viewsets.ModelViewSet):
    queryset = KeyResult.objects.all()
    serializer_class = KeyResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        kr = serializer.save()
        kr.okr.calculate_progress()

    def perform_update(self, serializer):
        kr = serializer.save()
        kr.okr.calculate_progress()
