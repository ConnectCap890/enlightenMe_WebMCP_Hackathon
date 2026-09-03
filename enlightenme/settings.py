from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import mongoengine
import os

ENV = os.getenv('DJANGO_ENV','development')

if ENV == 'production':
    load_dotenv('.env.production')
else:
    load_dotenv('.env')    

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv('SECRET_KEY', 'changeme')
DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')

INSTALLED_APPS = [
    # Django contrib apps (needed so models like Permission import correctly)
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'corsheaders',

    # Your apps
    'lectures',
    'quizzes',
    'users',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

ROOT_URLCONF = 'enlightenme.urls'

TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [],
    'APP_DIRS': True,
    'OPTIONS': {
        'context_processors': [
            'django.template.context_processors.debug',
            'django.template.context_processors.request',
            'django.contrib.auth.context_processors.auth',
            'django.contrib.messages.context_processors.messages',
        ],
    },
}]

WSGI_APPLICATION = 'enlightenme.wsgi.application'

# Minimal relational DB for Django internals (sqlite, local dev only)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# MongoDB Atlas (still used for your application models)
mongoengine.connect(host=os.getenv('MONGODB_URI'))

# DRF + JWT
REST_FRAMEWORK = {
     'DEFAULT_AUTHENTICATION_CLASSES': (
        'users.authentication.MongoJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
}

# CORS - include Vite dev server ports for local development
# CORS_ALLOWED_ORIGINS = [
#     'http://localhost:5500',
#     'http://127.0.0.1:5500',
#     'http://localhost:5173',
#     'http://127.0.0.1:5173',
#     'https://enlightenme.vercel.app',
# ]

# CORS_ALLOWED_ORIGIN_REGEXES = [
#     r"^https://.*\.vercel\.app$",
# ]

# _frontend_url = os.getenv('FRONTEND_URL', '')
# if _frontend_url:
#     CORS_ALLOWED_ORIGINS.append(_frontend_url)

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_CREDENTIALS = True

YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY', '')

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_TZ = True
