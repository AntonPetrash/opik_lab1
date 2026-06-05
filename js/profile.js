// Сторінка профілю - відображення даних користувача

// Функція для завантаження та відображення профілю
function loadProfile() {
    // Отримуємо поточного користувача з sessionStorage
    const userStr = sessionStorage.getItem('currentUser');
    
    if (!userStr) {
        // Якщо користувач не залогінений - перенаправляємо на сторінку входу
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const user = JSON.parse(userStr);
        
        // Заповнюємо таблицю даними користувача
        document.getElementById('profileName').innerText = user.name || 'Не вказано';
        document.getElementById('profileEmail').innerText = user.email || 'Не вказано';
        document.getElementById('profileGender').innerText = user.gender || 'Не вказано';
        document.getElementById('profileDob').innerText = user.dob || 'Не вказано';
        
        // Додатково: показуємо ID користувача (опціонально)
        const userIdElement = document.getElementById('profileId');
        if (userIdElement) {
            userIdElement.innerText = user.id || 'Невідомо';
        }
        
        // Додатково: показуємо дату реєстрації, якщо вона є в даних
        const registeredAtElement = document.getElementById('profileRegisteredAt');
        if (registeredAtElement && user.createdAt) {
            const date = new Date(user.createdAt);
            registeredAtElement.innerText = date.toLocaleDateString('uk-UA');
        } else if (registeredAtElement) {
            registeredAtElement.innerText = 'Невідомо';
        }
        
    } catch (err) {
        console.error('Помилка завантаження профілю:', err);
        // Якщо сталася помилка - перенаправляємо на логін
        window.location.href = 'login.html';
    }
}

// Функція для оновлення даних профілю (опціонально)
async function updateProfile(updatedData) {
    const userStr = sessionStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'login.html';
        return false;
    }
    
    const user = JSON.parse(userStr);
    
    try {
        // Оновлюємо дані на сервері
        const res = await fetch(`http://localhost:3000/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...user, ...updatedData })
        });
        
        if (!res.ok) throw new Error('Помилка оновлення профілю');
        
        const updatedUser = await res.json();
        
        // Оновлюємо дані в sessionStorage
        const { password, ...safeUser } = updatedUser;
        sessionStorage.setItem('currentUser', JSON.stringify(safeUser));
        
        // Перезавантажуємо сторінку для відображення оновлених даних
        location.reload();
        return true;
        
    } catch (err) {
        console.error('Помилка:', err);
        const messageDiv = document.getElementById('profileMessage');
        if (messageDiv) {
            messageDiv.innerHTML = '<div class="alert alert-danger">Помилка оновлення профілю</div>';
        }
        return false;
    }
}

// Додаємо кнопку повернення на сторінку таймерів (якщо її немає)
function addBackButton() {
    const backButtonContainer = document.getElementById('backButtonContainer');
    if (backButtonContainer && !document.getElementById('backToTimersBtn')) {
        backButtonContainer.innerHTML = `
            <a href="timers.html" class="btn btn-secondary mt-3">
                ← Повернутися до таймерів
            </a>
        `;
    }
}

// Ініціалізація сторінки
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    addBackButton();
});

// Експортуємо функції для використання в інших місцях (якщо потрібно)
window.updateProfile = updateProfile;