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
        if user.role == 'ADMIN' or user.is_superuser:
            return OKRGoal.objects.all().order_by('-created_at')
        if user.role == 'MANAGER':
            if user.department:
                from django.db.models import Q
                return OKRGoal.objects.filter(
                    Q(department=user.department) | Q(owner__department=user.department) | Q(owner=user)
                ).distinct().order_by('-created_at')
            return OKRGoal.objects.all().order_by('-created_at')
        # Empleado normal ve sus propios OKRs
        return OKRGoal.objects.filter(owner=user).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        owner = serializer.validated_data.get('owner')
        if not owner or (user.role == 'EMPLOYEE' and not user.is_superuser):
            owner = user
        department = serializer.validated_data.get('department') or owner.department or user.department
        serializer.save(owner=owner, department=department)

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
