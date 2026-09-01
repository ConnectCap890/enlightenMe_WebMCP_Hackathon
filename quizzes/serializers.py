from rest_framework import serializers

class QuizQuestionSerializer(serializers.Serializer):

    question = serializers.CharField(max_length= 600)
    options = serializers.ListField(child=serializers.CharField(max_length= 200))
    correct = serializers.IntegerField(min_value= 0, max_value= 3)
    explanation = serializers.CharField(allow_blank= True, max_length= 500)
    topic = serializers.CharField(allow_blank= True, max_length= 100)

class GenerateQuizSerializer(serializers.Serializer):

    lecture_id = serializers.CharField()
    difficulty = serializers.ChoiceField(choices=['easy', 'medium', 'hard'])


class QuizResponseSerializer(serializers.Serializer):
    id          = serializers.CharField()
    lecture_id  = serializers.CharField()
    user_id     = serializers.CharField()
    difficulty  = serializers.CharField()
    questions   = QuizQuestionSerializer(many=True)
    created_at  = serializers.CharField()    


class SubmitAnswerSerializer(serializers.Serializer):
    quiz_id    = serializers.CharField(required=True)
    lecture_id = serializers.CharField(required=True)
    answers    = serializers.ListField(
                   child=serializers.IntegerField(min_value=0, max_value=3)
                 )     

class QuestionBankSerializer(serializers.Serializer):

    id          = serializers.CharField()
    topic       = serializers.CharField(max_length=100)
    difficulty  = serializers.CharField()
    question    = serializers.CharField(max_length=600)
    options     = serializers.ListField(child=serializers.CharField(max_length=200))
    correct     = serializers.IntegerField()
    explanation = serializers.CharField(allow_blank=True,max_length=500)
    source      = serializers.CharField()