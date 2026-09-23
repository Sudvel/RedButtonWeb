from django.shortcuts import render
from django.http import HttpResponse

from .models import Profile
# Create your views here.

import json
import threading
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404
from .models import Profile
# from .services import run_nornir_for_profile - в будущем функция Nornir.


def index(request):
    # Тестовые данные. В будущем они будут браться из базы данных (Profile.objects.all())
    profiles = Profile.objects.all()
    context = {
        'profiles': profiles
    }

    return render(request, 'homepage/index.html', context=context)

@require_POST
def run_profile_view(request):
    # 1. Проверяем парсинг входящего JSON
    try:
        data = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        return JsonResponse({'error': f'Некорректный JSON: {str(e)}'}, status=400)

    # 2. Проверяем наличие profile_id
    profile_id = data.get('profile_id')
    if not profile_id:
        return JsonResponse({'error': 'Параметр profile_id не передан'}, status=400)

    # 3. Основная логика (здесь позже будет вызов Nornir)
    try:
        # Временная заглушка для проверки связки
        return JsonResponse({
            'status': 'success',
            'message': f'Команда для профиля #{profile_id} успешно отправлена!'
        })
    except Exception as e:
        return JsonResponse({'error': f'Внутренняя ошибка: {str(e)}'}, status=500)

