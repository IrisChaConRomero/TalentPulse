from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from authentication.views import (
    UserViewSet, DepartmentViewSet, LoginAPIView,
    LogoutAPIView, CurrentUserAPIView, RegisterAPIView
)
from okrs.views import OKRGoalViewSet, KeyResultViewSet
from reviews.views import PerformanceReviewViewSet, FeedbackViewSet
from analytics.views import DashboardAnalyticsAPIView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'okrs', OKRGoalViewSet, basename='okr')
router.register(r'key-results', KeyResultViewSet, basename='keyresult')
router.register(r'reviews', PerformanceReviewViewSet, basename='review')
router.register(r'feedback', FeedbackViewSet, basename='feedback')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', LoginAPIView.as_view(), name='api_login'),
    path('api/auth/logout/', LogoutAPIView.as_view(), name='api_logout'),
    path('api/auth/me/', CurrentUserAPIView.as_view(), name='api_current_user'),
    path('api/auth/register/', RegisterAPIView.as_view(), name='api_register'),
    path('api/analytics/dashboard/', DashboardAnalyticsAPIView.as_view(), name='api_dashboard_analytics'),
]
