from django.urls import path
from . import views

appname = 'homepage'

urlpatterns = [
    path('', views.index, name='home'),
]