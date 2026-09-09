from rest_framework import serializers
from .models import CustomUser, Department, RoleChoices

class DepartmentSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'budget', 'created_at', 'member_count']

    def get_member_count(self, obj):
        return obj.members.count()

class UserSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'password', 'first_name', 'last_name',
            'role', 'role_display', 'department', 'department_name',
            'job_title', 'bio', 'avatar_url', 'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']

    def create(self, validated_data):
        password = validated_data.pop('password', None) or 'talentpulse123'
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'department', 'job_title']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', RoleChoices.EMPLOYEE),
            department=validated_data.get('department', None),
            job_title=validated_data.get('job_title', 'Especialista')
        )
        return user
