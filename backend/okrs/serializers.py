from rest_framework import serializers
from .models import OKRGoal, KeyResult
from authentication.serializers import UserSerializer, DepartmentSerializer

class KeyResultSerializer(serializers.ModelSerializer):
    completion_percentage = serializers.ReadOnlyField()

    class Meta:
        model = KeyResult
        fields = [
            'id', 'okr', 'title', 'target_value', 'current_value',
            'unit', 'weight', 'completion_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class OKRGoalSerializer(serializers.ModelSerializer):
    key_results = KeyResultSerializer(many=True, read_only=True)
    owner_detail = UserSerializer(source='owner', read_only=True)
    department_detail = DepartmentSerializer(source='department', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = OKRGoal
        fields = [
            'id', 'title', 'description', 'owner', 'owner_detail',
            'department', 'department_detail', 'quarter', 'status',
            'status_display', 'progress', 'key_results', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
