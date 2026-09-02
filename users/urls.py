from django.urls import path
from users import views

urlpatterns = [
    path('register/',  views.register,     name='register'),
    path('login/',     views.login,        name='login'),
    path('profile/',   views.get_profile,  name='get_profile'),
    path('progress/',  views.get_progress, name='get_progress'),
]