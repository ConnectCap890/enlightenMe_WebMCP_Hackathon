from django.urls import path, include

urlpatterns = [
    path('api/lectures/', include('lectures.urls')),
    path('api/quizzes/',  include('quizzes.urls')),
    path('api/users/',    include('users.urls')),
]
