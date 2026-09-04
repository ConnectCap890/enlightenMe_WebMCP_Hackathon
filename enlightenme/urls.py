from django.urls import path, include
from django.http import FileResponse
from django.conf import settings
import os

def serve_openapi(request):
    file_path = os.path.join(settings.BASE_DIR, 'openapi.yaml')
    return FileResponse(open(file_path, 'rb'), content_type='application/yaml')

urlpatterns = [
    path('openapi.yaml',  serve_openapi),
    path('api/lectures/', include('lectures.urls')),
    path('api/quizzes/',  include('quizzes.urls')),
    path('api/users/',    include('users.urls')),
]
