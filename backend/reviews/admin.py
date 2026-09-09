from django.contrib import admin
from .models import PerformanceReview, Feedback

@admin.register(PerformanceReview)
class PerformanceReviewAdmin(admin.ModelAdmin):
    list_display = ('period', 'evaluatee', 'evaluator', 'overall_score', 'status', 'created_at')
    list_filter = ('period', 'status')
    search_fields = ('evaluatee__username', 'evaluator__username', 'strengths')

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'is_anonymous', 'created_at')
    list_filter = ('is_anonymous',)
    search_fields = ('sender__username', 'receiver__username', 'content')
