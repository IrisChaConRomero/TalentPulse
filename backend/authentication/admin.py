from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Department

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'budget', 'created_at')
    search_fields = ('name', 'description')

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'department', 'job_title', 'is_staff')
    list_filter = ('role', 'department', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Información de TalentPulse', {
            'fields': ('role', 'department', 'job_title', 'bio', 'avatar_url')
        }),
    )
