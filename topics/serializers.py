from rest_framework import serializers

class KeyConceptSerializer(serializers.Serializer):
    title = serializers.CharField(max_length= 200)
    explanation = serializers.CharField(max_length= 500)

class LectureCreateSerializer(serializers.Serializer):
    youtube_url = serializers.URLField(required=True)
    title       = serializers.CharField(max_length=200, required=False)


class LectureResponseSerializer(serializers.Serializer):
    id = serializers.CharField()
    user_id = serializers.CharField()
    title = serializers.CharField(max_length= 200)
    youtube_url = serializers.CharField(max_length=300)
    summary = serializers.CharField(allow_blank= True)
    key_concepts = KeyConceptSerializer(many=True)
    created_at = serializers.CharField()

class SearchLectureSerializer(serializers.Serializer):

    topic = serializers.CharField(max_length= 200,required= True)
        