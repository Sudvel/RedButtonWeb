document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // Элементы DOM
    // ----------------------------------------------------
    const mainButton = document.getElementById('mainActionButton');
    const profileInput = document.getElementById('profileInput');
    const profileDropdown = document.getElementById('profileDropdown');
    const profileItems = document.querySelectorAll('.profile-item');
    const noResultsItem = document.getElementById('noResultsItem');
    const clearBtn = document.getElementById('clearProfileBtn');

    // Переменная для хранения ID выбранного профиля
    let selectedProfileId = null;

    // Вспомогательная функция для получения CSRF-токена Django из Cookie
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

    // ----------------------------------------------------
    // 1. Логика поиска и выбора профиля
    // ----------------------------------------------------
    if (profileInput && profileDropdown) {
        const showDropdown = () => {
            profileDropdown.classList.remove('d-none');
            filterProfiles(profileInput.value);
        };

        profileInput.addEventListener('focus', showDropdown);
        profileInput.addEventListener('click', showDropdown);

        // Живой поиск
        profileInput.addEventListener('input', (e) => {
            filterProfiles(e.target.value);
            // Если пользователь вручную стирает или меняет текст — сбрасываем выбранный ID
            selectedProfileId = null;
        });

        function filterProfiles(query) {
            const filter = query.trim().toLowerCase();
            let visibleCount = 0;

            profileItems.forEach(item => {
                const text = item.textContent.trim().toLowerCase();
                if (text.includes(filter)) {
                    item.classList.remove('d-none');
                    visibleCount++;
                } else {
                    item.classList.add('d-none');
                }
            });

            if (noResultsItem) {
                noResultsItem.classList.toggle('d-none', visibleCount > 0);
            }
        }

        // Выбор профиля по клику
        profileItems.forEach(item => {
            item.addEventListener('click', () => {
                profileInput.value = item.textContent.trim();
                selectedProfileId = item.getAttribute('data-id'); // Сохраняем ID из data-id
                profileDropdown.classList.add('d-none');
            });
        });

        // Очистить строку выбора
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                profileInput.value = '';
                selectedProfileId = null;
                profileDropdown.classList.add('d-none');
                profileInput.focus();
            });
        }

        // Закрытие списка при клике вне поля
        document.addEventListener('click', (e) => {
            if (!profileInput.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.add('d-none');
            }
        });
    }

    // ----------------------------------------------------
    // 2. Логика кнопки "ДЕЙСТВИЕ" (Отправка в Django / Nornir)
    // ----------------------------------------------------
    if (mainButton) {
        mainButton.addEventListener('click', async () => {
            // Проверка: выбран ли профиль
            if (!selectedProfileId) {
                alert('Пожалуйста, выберите профиль из списка перед выполнением!');
                return;
            }

            // Подтверждение действия
            const isConfirmed = confirm(`Вы уверены, что хотите запустить сценарий "${profileInput.value}"?`);
            if (!isConfirmed) {
                return;
            }

            // Блокируем кнопку на время выполнения запроса
            mainButton.disabled = true;
            const originalText = mainButton.textContent;
            mainButton.textContent = 'ВЫПОЛНЕНИЕ...';

            try {
                const csrfToken = getCookie('csrftoken');
                const response = await fetch('/api/run-profile/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify({
                        profile_id: selectedProfileId
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || `Ошибка сервера: ${response.status}`);
                }

                // ТОЛЬКО ПРИ УСПЕШНОМ ОТВЕТЕ СЕРВЕРА КРАСИМ В ЗЕЛЕНЫЙ
                mainButton.classList.remove('btn-danger');
                mainButton.classList.add('btn-success');
                mainButton.setAttribute('data-active', 'true');
                mainButton.textContent = 'АКТИВНО';

                alert(`Успех: ${data.message || 'Команды применены'}`);

            } catch (error) {
                // При ошибке цвет остается красным
                console.error('Ошибка исполнения:', error);
                alert(`Ошибка: ${error.message}`);
                mainButton.textContent = originalText;
            } finally {
                // Разблокируем возможность клика
                mainButton.disabled = false;
            }
        });
    }
});