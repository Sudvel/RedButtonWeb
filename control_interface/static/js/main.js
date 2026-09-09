document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Логика переключения кнопки (Красный <-> Зеленый)
    // ----------------------------------------------------
    const mainButton = document.getElementById('mainActionButton');

    if (mainButton) {
        mainButton.addEventListener('click', () => {
            const isActive = mainButton.getAttribute('data-active') === 'true';

            if (isActive) {
                // Возвращаем в исходное (красное) состояние
                mainButton.classList.remove('btn-success');
                mainButton.classList.add('btn-danger');
                mainButton.setAttribute('data-active', 'false');
                mainButton.textContent = 'ДЕЙСТВИЕ';
            } else {
                // Переключаем в активное (зеленое) состояние
                mainButton.classList.remove('btn-danger');
                mainButton.classList.add('btn-success');
                mainButton.setAttribute('data-active', 'true');
                mainButton.textContent = 'АКТИВНО';
            }
        });
    }

    // ----------------------------------------------------
    // 2. Логика поиска и выбора профиля
    // ----------------------------------------------------
    const profileInput = document.getElementById('profileInput');
    const profileDropdown = document.getElementById('profileDropdown');
    const profileItems = document.querySelectorAll('.profile-item');
    const noResultsItem = document.getElementById('noResultsItem');
    const clearBtn = document.getElementById('clearProfileBtn');

    if (profileInput && profileDropdown) {
        // Показ списка при фокусе или клике на строку
        const showDropdown = () => {
            profileDropdown.classList.remove('d-none');
            filterProfiles(profileInput.value);
        };

        profileInput.addEventListener('focus', showDropdown);
        profileInput.addEventListener('click', showDropdown);

        // Живой поиск при вводе текста
        profileInput.addEventListener('input', (e) => {
            filterProfiles(e.target.value);
        });

        // Функция фильтрации
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

            if (visibleCount === 0) {
                noResultsItem.classList.remove('d-none');
            } else {
                noResultsItem.classList.add('d-none');
            }
        }

        // Выбор профиля по клику
        profileItems.forEach(item => {
            item.addEventListener('click', () => {
                profileInput.value = item.textContent.trim();
                profileDropdown.classList.add('d-none');
            });
        });

        // Очистить строку выбора
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                profileInput.value = '';
                profileDropdown.classList.add('d-none');
            });
        }

        // Закрытие списка при клике вне поля
        document.addEventListener('click', (e) => {
            if (!profileInput.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.add('d-none');
            }
        });
    }
});