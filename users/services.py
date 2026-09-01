import jwt
from datetime import datetime, timedelta
from django.conf import settings
from users.models import User, Progress, WeakTopic
from lectures.models import Lecture


def generate_tokens(user_id: str) -> dict:
    """
    Generates JWT access and refresh tokens.

    """
    access_payload = {
        'user_id': user_id,
        'exp':     datetime.utcnow() + timedelta(days=7),
        'type':    'access'
    }

    refresh_payload = {
        'user_id': user_id,
        'exp':     datetime.utcnow() + timedelta(days=30),
        'type':    'refresh'
    }

    access_token  = jwt.encode(access_payload,  settings.SECRET_KEY, algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')

    return {
        'access':  access_token,
        'refresh': refresh_token,
    }


def decode_token(token: str) -> dict:
    """
    Decodes and validates a JWT token.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=['HS256']
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError('Token has expired — please login again')
    except jwt.InvalidTokenError:
        raise ValueError('Invalid token')


def create_user(username: str, email: str, password: str) -> User:
    """
    Creates a new user and saves to MongoDB.
    """
    if User.objects(email=email).first():
        raise ValueError('Email already registered')

    if User.objects(username=username).first():
        raise ValueError('Username already taken')

    user = User(
        username=username,
        email=email,
    )
    user.set_password(password)
    user.save()
    return user


def login_user(email: str, password: str) -> dict:
    """
    Validates credentials and returns JWT tokens + user data.
    """
    user = User.objects(email=email).first()

    if not user:
        raise ValueError('No account found with this email')

    if not user.check_password(password):
        raise ValueError('Incorrect password')

    tokens = generate_tokens(str(user.id))

    return {
        'user':   user.to_dict(),
        'tokens': tokens,
    }


def save_progress(
    user_id:     str,
    quiz_id:     str,
    lecture_id:  str,
    difficulty:  str,
    score:       int,
    total:       int,
    percentage:  float,
    weak_topics: list,
) -> Progress:
    """
    Saves quiz attempt to MongoDB.
    weak_topics is a list of topic strings answered wrong.
    """
    progress = Progress(
        user_id    = user_id,
        quiz_id    = quiz_id,
        lecture_id = lecture_id,
        difficulty = difficulty,
        score      = score,
        total      = total,
        percentage = percentage,
    )

    topic_counts = {}
    for topic in weak_topics:
        if topic in topic_counts:
            topic_counts[topic] += 1
        else:
            topic_counts[topic] = 1

    for topic, count in topic_counts.items():
        progress.weak_topics.append(
            WeakTopic(topic=topic, wrong_count=count)
        )

    progress.save()
    return progress


def get_user_stats(user_id: str) -> dict:
    """
    Returns overall stats for dashboard.
    """
    all_progress = Progress.objects(user_id=user_id)

    if not all_progress:
        return {
            'quizzes_taken': 0,
            'average_score': 0,
            'best_score':    0,
            'total_topics':  0,
        }

    percentages  = [p.percentage for p in all_progress]
    average      = round(sum(percentages) / len(percentages), 1)
    best         = max(percentages)
    total_topics = Lecture.objects(user_id=user_id).count()

    return {
        'quizzes_taken': len(all_progress),
        'average_score': average,
        'best_score':    best,
        'total_topics':  total_topics,
    }