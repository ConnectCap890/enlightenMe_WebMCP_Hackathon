from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from users.serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserResponseSerializer,
)
from users.services import (
    create_user,
    login_user,
    get_user_stats,
)
from users.models import Progress


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Registers a new user.
    AllowAny — no token needed to register.
    """
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        # Return the created user dict directly (avoid mis-initializing a DRF Serializer)
        return Response(user.to_dict(), status=status.HTTP_201_CREATED)

    except ValueError as e:
        # Known validation error from create_user (email/username taken)
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        # Catch-all so the API returns a JSON error instead of a 500 HTML page.
        # Log exception to console for debugging.
        import traceback
        traceback.print_exc()
        return Response({'error': 'Internal server error', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Logs in a user and returns JWT tokens.
    AllowAny — no token needed to login.
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        result = login_user(
            email    = serializer.validated_data['email'],
            password = serializer.validated_data['password'],
        )
        return Response(result, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    Returns logged in user's profile + stats.
    """
    try:
        stats    = get_user_stats(str(request.user.id))
        response = UserResponseSerializer(request.user.to_dict())

        return Response({
            'user':  response.data,
            'stats': stats,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_progress(request):
    """
    Returns all progress records for logged in user.
    """
    try:
        all_progress = Progress.objects(user_id=str(request.user.id))
        data         = [p.to_dict() for p in all_progress]

        return Response(
            {'progress': data},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )