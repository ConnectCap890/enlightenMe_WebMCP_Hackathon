from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from users.models import User
from users.services import decode_token


class MongoJWTAuthentication(BaseAuthentication):
    """
    Custom JWT authentication for MongoDB users.
    
    """
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]

        try:
            payload = decode_token(token)
            user_id = payload.get('user_id')
            user    = User.objects(id=user_id).first()

            if not user:
                raise AuthenticationFailed('User not found')

            return (user, token)

        except ValueError as e:
            raise AuthenticationFailed(str(e))