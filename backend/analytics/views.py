from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Avg, Count
from authentication.models import CustomUser, Department
from okrs.models import OKRGoal, OKRStatusChoices
from reviews.models import PerformanceReview

class DashboardAnalyticsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_users = CustomUser.objects.count()
        total_departments = Department.objects.count()
        
        okrs_qs = OKRGoal.objects.all()
        if request.user.role == 'EMPLOYEE' and not request.user.is_superuser:
            okrs_qs = okrs_qs.filter(owner=request.user)

        total_okrs = okrs_qs.count()
        completed_okrs = okrs_qs.filter(status=OKRStatusChoices.COMPLETED).count()
        in_progress_okrs = okrs_qs.filter(status=OKRStatusChoices.IN_PROGRESS).count()
        at_risk_okrs = okrs_qs.filter(status=OKRStatusChoices.AT_RISK).count()

        avg_okr_progress = okrs_qs.aggregate(Avg('progress'))['progress__avg'] or 0.0

        reviews_qs = PerformanceReview.objects.all()
        avg_score = reviews_qs.aggregate(Avg('overall_score'))['overall_score__avg'] or 0.0

        department_stats = []
        for dept in Department.objects.annotate(member_count=Count('members')):
            dept_okrs = OKRGoal.objects.filter(department=dept)
            dept_avg_progress = dept_okrs.aggregate(Avg('progress'))['progress__avg'] or 0.0
            department_stats.append({
                'id': dept.id,
                'name': dept.name,
                'member_count': dept.member_count,
                'avg_progress': round(dept_avg_progress, 1),
                'okr_count': dept_okrs.count()
            })

        return Response({
            'overview': {
                'total_users': total_users,
                'total_departments': total_departments,
                'total_okrs': total_okrs,
                'completed_okrs': completed_okrs,
                'in_progress_okrs': in_progress_okrs,
                'at_risk_okrs': at_risk_okrs,
                'avg_okr_progress': round(avg_okr_progress, 1),
                'avg_performance_score': round(avg_score, 2),
            },
            'departments': department_stats
        })
