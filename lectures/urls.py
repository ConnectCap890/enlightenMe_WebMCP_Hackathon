from django.urls import path
from lectures import views

urlpatterns = [
    path('search/',                views.search_lectures,  name='search_lectures'),
    path('create/',                views.create_lecture,   name='create_lecture'),
    path('all/',                   views.get_all_lectures, name='get_all_lectures'),
    path('<str:lecture_id>/',      views.get_lecture,      name='get_lecture'),
    path('<str:lecture_id>/save/', views.save_explanation, name='save_explanation'),
    path('<str:lecture_id>/delete/', views.delete_lecture, name='delete_lecture'),
]