from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from lectures.models import Lecture, KeyConcept
from lectures.serializers import (
    LectureCreateSerializer,
    LectureResponseSerializer,
    SearchLectureSerializer,
    
)
from lectures.services import (
    extract_video_id,
    fetch_transcript,
    fetch_video_details,
    search_youtube_lectures,
)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def search_lectures(request):
    """
    Searches YouTube for top 3 lectures on a topic.
    Called by WebMCP tool: search_lectures
    """
    serializer = SearchLectureSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    topic   = serializer.validated_data['topic']
    results = search_youtube_lectures(topic)

    return Response({
        'topic':   topic,
        'results': results,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_lecture(request):
    """
    Creates a lecture from a YouTube URL.
    Fetches transcript and video details automatically.
    Called by WebMCP tool: create_lecture
    """
    serializer = LectureCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    source      = serializer.validated_data['source']
    youtube_url = serializer.validated_data.get('youtube_url', '')
    title       = serializer.validated_data.get('title', '')

    try:
        if source == 'youtube':
            video_id = extract_video_id(youtube_url)
            transcript = fetch_transcript(video_id)

            if not title:
                details = fetch_video_details(video_id)
                title   = details['title']

        lecture = Lecture(
            user_id     = str(request.user.id),
            title       = title,
            source      = source,
            youtube_url = youtube_url,
            transcript  = transcript if source == 'youtube' else '',
        )
        lecture.save()

        response = LectureResponseSerializer(lecture.to_dict())
        return Response(response.data, status=status.HTTP_201_CREATED)

    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_explanation(request, lecture_id):
    """
    Saves ChatGPT generated explanations to lecture.
    Called by WebMCP tool after ChatGPT generates content.
    """
    try:
        lecture = Lecture.objects(
            id      = lecture_id,
            user_id = str(request.user.id)
        ).first()

        if not lecture:
            return Response(
                {'error': 'Lecture not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        data = request.data

        lecture.plain_english  = data.get('plain_english',  lecture.plain_english)
        lecture.technical      = data.get('technical',      lecture.technical)
        lecture.advanced       = data.get('advanced',       lecture.advanced)
        lecture.related_topics = data.get('related_topics', lecture.related_topics)

        if 'key_concepts' in data:
            lecture.key_concepts = []
            for kc in data['key_concepts']:
                lecture.key_concepts.append(
                    KeyConcept(
                        title       = kc['title'],
                        explanation = kc['explanation'],
                    )
                )

        lecture.save()

        response = LectureResponseSerializer(lecture.to_dict())
        return Response(response.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lecture(request, lecture_id):
    """
    Returns a single lecture by ID.
    """
    lecture = Lecture.objects(
        id      = lecture_id,
        user_id = str(request.user.id)
    ).first()

    if not lecture:
        return Response(
            {'error': 'Lecture not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    response = LectureResponseSerializer(lecture.to_dict())
    return Response(response.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_lectures(request):
    """
    Returns all lectures for the logged in user.
    Used to populate the dashboard.
    """
    lectures = Lecture.objects(user_id=str(request.user.id))
    data     = [lecture.to_dict() for lecture in lectures]
    return Response({'lectures': data}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_lecture(request, lecture_id):
    """
    Deletes a lecture by ID.
    Only owner can delete their own lecture.
    """
    lecture = Lecture.objects(
        id      = lecture_id,
        user_id = str(request.user.id)
    ).first()

    if not lecture:
        return Response(
            {'error': 'Lecture not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    lecture.delete()
    return Response(
        {'message': 'Lecture deleted successfully'},
        status=status.HTTP_200_OK
    )
