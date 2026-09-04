from django.urls import path, include
from django.http import FileResponse
import os

def serve_openapi(request):
    file_path = os.path.join(os.path.dirname(__file__), '..', 'openapi.yaml')
    return FileResponse(open(file_path, 'rb'), content_type='application/yaml')
urlpatterns = [
    path('openapi.yaml', serve_openapi),
    path('api/lectures/', include('lectures.urls')),
    path('api/quizzes/',  include('quizzes.urls')),
    path('api/users/',    include('users.urls')),
]
