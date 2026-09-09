from rest_framework import serializers
from .models import PerformanceReview, Feedback
from authentication.serializers import UserSerializer

class PerformanceReviewSerializer(serializers.ModelSerializer):
    evaluator_detail = UserSerializer(source='evaluator', read_only=True)
    evaluatee_detail = UserSerializer(source='evaluatee', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = PerformanceReview
        fields = [
            'id', 'evaluator', 'evaluator_detail', 'evaluatee', 'evaluatee_detail',
            'period', 'leadership_score', 'teamwork_score', 'technical_score',
            'overall_score', 'strengths', 'areas_for_improvement',
            'status', 'status_display', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'evaluator', 'overall_score', 'created_at', 'updated_at']

class FeedbackSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    receiver_name = serializers.SerializerMethodField()

    class Meta:
        model = Feedback
        fields = ['id', 'sender', 'sender_name', 'receiver', 'receiver_name', 'content', 'is_anonymous', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']

    def get_sender_name(self, obj):
        if obj.is_anonymous:
            return 'Anónimo'
        full = f"{obj.sender.first_name} {obj.sender.last_name}".strip()
        return full or obj.sender.username

    def get_receiver_name(self, obj):
        full = f"{obj.receiver.first_name} {obj.receiver.last_name}".strip()
        return full or obj.receiver.username
