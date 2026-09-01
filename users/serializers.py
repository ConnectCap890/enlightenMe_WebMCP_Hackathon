from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=50, required=True)
    email    = serializers.EmailField(required=True)
    password = serializers.CharField(min_length=8, required=True)

class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)

class UserResponseSerializer(serializers.Serializer):
    id         = serializers.CharField()
    username   = serializers.CharField()
    email      = serializers.CharField()
    created_at = serializers.CharField()

class WeakTopicSerializer(serializers.Serializer):
    topic       = serializers.CharField(max_length=100)
    wrong_count = serializers.IntegerField()

class ProgressResponseSerializer(serializers.Serializer):
    id           = serializers.CharField()
    user_id      = serializers.CharField()
    quiz_id      = serializers.CharField()
    lecture_id   = serializers.CharField()
    difficulty   = serializers.CharField()
    score        = serializers.IntegerField()
    total        = serializers.IntegerField()
    percentage   = serializers.FloatField()
    weak_topics  = WeakTopicSerializer(many=True)
    completed_at = serializers.CharField()

class WeakTopicsSummarySerializer(serializers.Serializer):
    topic       = serializers.CharField()
    wrong_count = serializers.IntegerField()
    priority    = serializers.CharField()