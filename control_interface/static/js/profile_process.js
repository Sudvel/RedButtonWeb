// Ждем, пока браузер полностью построит DOM-дерево страницы
document.addEventListener('DOMContentLoaded', () => {

    // 1. НАХОДИМ ЭЛЕМЕНТЫ В DOM
    const profileInput = document.getElementById('profileInput');
    const profileDropdown = document.getElementById('profileDropdown');
    const clearProfileBtn = document.getElementById('clearProfileBtn');
    const actionButton = document.getElementById('mainActionButton');
    
    // Переменная для хранения ID выбранного профиля в памяти страницы
    let currentProfileId = null;

    // Вспомогательная функция для получения CSRF-токена из cookies Django
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // 2. УПРАВЛЕНИЕ ВЫБОРОМ ПРОФИЛЯ
    // Показываем выпадающий список при клике в поле
    profileInput.addEventListener('focus', () => {
        profileDropdown.classList.remove('d-none');
    });

    // Скрываем список, если кликнули мимо него
    document.addEventListener('click', (event) => {
        if (!event.target.closest('#profileInput') && !event.target.closest('#profileDropdown')) {
            profileDropdown.classList.add('d-none');
        }
    });

    // Выбор профиля из списка (клик по <li>)
    document.querySelectorAll('.profile-item').forEach(item => {
        item.addEventListener('click', () => {
            currentProfileId = item.getAttribute('data-id'); // Сохраняем ID
            profileInput.value = item.textContent.trim();    // Отображаем имя в инпуте
            profileDropdown.classList.add('d-none');         // Прячем меню
        });
    });

    // Сброс выбора
    clearProfileBtn.addEventListener('click', () => {
        currentProfileId = null;
        profileInput.value = '';
        profileInput.focus();
    });

    // 3. ПЕРЕДАЧА УПРАВЛЕНИЯ ПРИ НАЖАТИИ НА КНОПКУ "ДЕЙСТВИЕ"
    actionButton.addEventListener('click', async () => {
        
        // Шаг А: Проверяем, выбран ли профиль
        if (!currentProfileId) {
            alert('Сначала выберите профиль из списка!');
            return;
        }

        // Шаг Б: Подтверждение (защита от случайного клика)
        const isConfirmed = confirm(`Вы уверены, что хотите применить профиль "${profileInput.value}"?`);
        if (!isConfirmed) {
            return; // Оператор нажал "Отмена", прекращаем выполнение
        }

        // Шаг В: Блокируем кнопку, чтобы предотвратить повторные нажатия
        actionButton.disabled = true;
        const originalButtonText = actionButton.textContent;
        actionButton.textContent = 'ВЫПОЛНЕНИЕ...';

        // Шаг Г: Отправка запроса в Django
        try {
            const response = await fetch('/api/run-profile/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') // Передаем CSRF-токен в заголовке
                },
                body: JSON.stringify({
                    profile_id: currentProfileId
                })
            });

            const data = await response.json();

            // Шаг Д: Обработка ответа от Django
            if (response.ok) {
                alert(`Успех: ${data.message}`);
            } else {
                alert(`Ошибка: ${data.error || 'Произошел сбой при выполнении'}`);
            }

        } catch (networkError) {
            alert(`Сетевая ошибка: не удалось связаться с сервером. ${networkError}`);
        } finally {
            // Шаг Е: Возвращаем кнопку в исходное состояние
            actionButton.disabled = false;
            actionButton.textContent = originalButtonText;
        }
    });

});