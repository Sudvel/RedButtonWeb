from django.urls import path
from . import views

appname = 'homepage'

urlpatterns = [
    path('', views.index, name='home'),
    path('api/run-profile/', views.run_profile_view, name='run_profile'),
]