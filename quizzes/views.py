from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from quizzes.models import Quiz, QuestionBank
from quizzes.serializers import (
    GenerateQuizSerializer,
    QuizResponseSerializer,
    SubmitAnswerSerializer,
    
)
from quizzes.services import (
    build_quiz_prompt,
    save_quiz,
    calculate_score,
    get_weak_topics_summary,
)
from users.services import save_progress


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_quiz_prompt(request):
    """
    Returns a prompt for ChatGPT to generate quiz questions.
    ChatGPT uses this prompt to generate questions then
    calls save_quiz to store them.
    """
    serializer = GenerateQuizSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    lecture_id = serializer.validated_data['lecture_id']
    difficulty = serializer.validated_data['difficulty']

    try:
        from lectures.models import Lecture
        lecture = Lecture.objects(
            id      = lecture_id,
            user_id = str(request.user.id)
        ).first()

        if not lecture:
            return Response(
                {'error': 'Lecture not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        prompt = build_quiz_prompt(
            title      = lecture.title,
            transcript = lecture.transcript,
            difficulty = difficulty,
        )

        return Response({
            'prompt':     prompt,
            'lecture_id': lecture_id,
            'difficulty': difficulty,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_quiz_view(request):
    """
    Saves ChatGPT generated questions to MongoDB.
    Called by WebMCP tool after ChatGPT generates quiz.
    """
    lecture_id     = request.data.get('lecture_id')
    difficulty     = request.data.get('difficulty')
    questions_data = request.data.get('questions', [])

    if not lecture_id or not difficulty or not questions_data:
        return Response(
            {'error': 'lecture_id, difficulty and questions are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        quiz     = save_quiz(
            lecture_id     = lecture_id,
            user_id        = str(request.user.id),
            difficulty     = difficulty,
            questions_data = questions_data,
        )
        response = QuizResponseSerializer(quiz.to_dict())
        return Response(response.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_answer(request):
    """
    Scores a quiz attempt and saves progress.
    Called by WebMCP tool when user finishes quiz.
    """
    serializer = SubmitAnswerSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    quiz_id    = serializer.validated_data['quiz_id']
    lecture_id = serializer.validated_data['lecture_id']
    answers    = serializer.validated_data['answers']

    try:
        result = calculate_score(quiz_id, answers)

        save_progress(
            user_id     = str(request.user.id),
            quiz_id     = quiz_id,
            lecture_id  = lecture_id,
            difficulty  = result['difficulty'],
            score       = result['score'],
            total       = result['total'],
            percentage  = result['percentage'],
            weak_topics = result['weak_topics'],
        )

        return Response(result, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_weak_topics(request):
    """
    Returns ranked weak topics for the logged in user.
    Called by WebMCP tool: get_weak_topics
    """
    try:
        topics = get_weak_topics_summary(str(request.user.id))
        return Response({'weak_topics': topics}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz(request, quiz_id):
    """
    Returns a single quiz by ID.
    """
    quiz = Quiz.objects(
        id      = quiz_id,
        user_id = str(request.user.id)
    ).first()

    if not quiz:
        return Response(
            {'error': 'Quiz not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    response = QuizResponseSerializer(quiz.to_dict())
    return Response(response.data, status=status.HTTP_200_OK)
