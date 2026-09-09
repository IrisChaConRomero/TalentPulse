from django.contrib import admin
from .models import OKRGoal, KeyResult

class KeyResultInline(admin.TabularInline):
    model = KeyResult
    extra = 1

@admin.register(OKRGoal)
class OKRGoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'department', 'quarter', 'status', 'progress', 'created_at')
    list_filter = ('quarter', 'status', 'department')
    search_fields = ('title', 'description', 'owner__username')
    inlines = [KeyResultInline]

@admin.register(KeyResult)
class KeyResultAdmin(admin.ModelAdmin):
    list_display = ('title', 'okr', 'target_value', 'current_value', 'unit', 'weight')
    search_fields = ('title', 'okr__title')
