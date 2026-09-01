from rest_framework import serializers


class KeyConceptSerializer(serializers.Serializer):
    title       = serializers.CharField(max_length=200)
    explanation = serializers.CharField(max_length=500)


class LectureCreateSerializer(serializers.Serializer):
    youtube_url = serializers.URLField(required=False, allow_blank=True)
    title       = serializers.CharField(max_length=200, required=False)
    source      = serializers.ChoiceField(choices=['youtube', 'chatgpt'])


class LectureResponseSerializer(serializers.Serializer):
    id             = serializers.CharField()
    user_id        = serializers.CharField()
    title          = serializers.CharField(max_length=200)
    source         = serializers.CharField()
    youtube_url    = serializers.CharField(allow_blank=True)
    plain_english  = serializers.CharField(allow_blank=True)
        