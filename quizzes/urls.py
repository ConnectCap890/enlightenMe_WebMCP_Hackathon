from django.urls import path
from quizzes import views

urlpatterns = [
    path('prompt/',              views.get_quiz_prompt,  name='get_quiz_prompt'),
    path('save/',                views.save_quiz_view,   name='save_quiz'),
    path('submit/',              views.submit_answer,    name='submit_answer'),
    path('weak-topics/',         views.get_weak_topics,  name='get_weak_topics'),
    path('<str:quiz_id>/',       views.get_quiz,         name='get_quiz'),
]