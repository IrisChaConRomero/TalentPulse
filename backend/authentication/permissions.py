from rest_framework import permissions
from .models import RoleChoices

class IsAdminRole(permissions.BasePermission):
    """Permiso solo para usuarios con rol ADMINISTRADOR o superusuarios."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and (
                request.user.role == RoleChoices.ADMIN or request.user.is_superuser
            )
        )

class IsManagerOrAdmin(permissions.BasePermission):
    """Permiso para Managers o Administradores."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and (
                request.user.role in [RoleChoices.ADMIN, RoleChoices.MANAGER] or request.user.is_superuser
            )
        )

class IsOwnerOrManagerOrAdmin(permissions.BasePermission):
    """Permite el acceso si el usuario es el creador/propietario del objeto o es Manager/Admin."""
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in [RoleChoices.ADMIN, RoleChoices.MANAGER] or request.user.is_superuser:
            return True
        # Verificar propiedad por owner o evaluatee/evaluator
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'evaluatee'):
            return obj.evaluatee == request.user or obj.evaluator == request.user
        if hasattr(obj, 'sender'):
            return obj.sender == request.user or obj.receiver == request.user
        return False
