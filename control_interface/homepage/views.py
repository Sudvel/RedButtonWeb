from django.shortcuts import render
from django.http import HttpResponse
# Create your views here.

def index(request):
    # Тестовые данные. В будущем они будут браться из базы данных (Profile.objects.all())
    mock_profiles = [
        {"id": 1, "name": "Вырубить всё"},
        {"id": 2, "name": "Профиль 1"},
        {"id": 3, "name": "Профиль 2"},
        {"id": 4, "name": "Профиль 3"},
    ]
    return render(request, 'homepage/index.html', {'profiles': mock_profiles})
