// ==================== ПЕРЕВІРКА АВТЕНТИФІКАЦІЇ ====================

function checkAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    const path = window.location.pathname;
    const isAuthPage = path.includes('login.html') || path.includes('register.html');
    const isTimerPage = path.includes('timers.html');

    if (!currentUser && !isAuthPage) {
        // Не залогінений і не на сторінках входу/реєстрації -> редірект на логін
        window.location.href = 'login.html';
    }
    if (currentUser && isAuthPage) {
        // Вже залогінений, але на сторінці входу/реєстрації -> редірект на таймери
        window.location.href = 'timers.html';
    }
    if (currentUser && !isAuthPage && !isTimerPage && !path.includes('profile.html') && !path.includes('about.html')) {
        // Якщо якась інша сторінка - перенаправляємо на таймери
        if (!path.includes('timers.html')) {
            window.location.href = 'timers.html';
        }
    }
}

// ==================== НАВІГАЦІЙНА ПАНЕЛЬ ====================

function updateNavbar() {
    const currentUser = sessionStorage.getItem('currentUser');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const profileLink = document.getElementById('profileLink');
    const timersLink = document.getElementById('timersLink');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!loginLink) return;

    if (currentUser) {
        // Користувач залогінений - показуємо профіль, таймери, кнопку виходу
        if (loginLink?.parentElement) loginLink.parentElement.classList.add('d-none');
        if (registerLink?.parentElement) registerLink.parentElement.classList.add('d-none');
        if (profileLink?.parentElement) profileLink.parentElement.classList.remove('d-none');
        if (timersLink?.parentElement) timersLink.parentElement.classList.remove('d-none');
        if (logoutBtn) logoutBtn.classList.remove('d-none');
    } else {
        // Користувач не залогінений - показуємо вхід та реєстрацію
        if (loginLink?.parentElement) loginLink.parentElement.classList.remove('d-none');
        if (registerLink?.parentElement) registerLink.parentElement.classList.remove('d-none');
        if (profileLink?.parentElement) profileLink.parentElement.classList.add('d-none');
        if (timersLink?.parentElement) timersLink.parentElement.classList.add('d-none');
        if (logoutBtn) logoutBtn.classList.add('d-none');
    }
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function loadNavbar() {
    // Перевіряємо, чи navbar вже завантажено
    if (document.querySelector('.navbar')) return;
    
    const navbarHtml = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="timers.html">
                <span style="font-size: 1.5rem;">⏰</span> TimerCountdown
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item" id="timersNavItem">
                        <a class="nav-link" id="timersLink" href="timers.html">Мої таймери</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="about.html">Про додаток</a>
                    </li>
                    <li class="nav-item" id="profileNavItem">
                        <a class="nav-link" id="profileLink" href="profile.html">Профіль</a>
                    </li>
                </ul>
                <ul class="navbar-nav">
                    <li class="nav-item" id="loginNavItem">
                        <a class="nav-link" id="loginLink" href="login.html">Вхід</a>
                    </li>
                    <li class="nav-item" id="registerNavItem">
                        <a class="nav-link" id="registerLink" href="register.html">Реєстрація</a>
                    </li>
                    <li class="nav-item" id="logoutNavItem">
                        <button class="btn btn-outline-light" id="logoutBtn" onclick="logout()">Вийти</button>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    `;
    document.body.insertAdjacentHTML('afterbegin', navbarHtml);
    updateNavbar();
}

// ==================== ДОПОМІЖНІ ФУНКЦІЇ ====================

// Показати повідомлення на сторінці
function showMessage(elementId, message, type) {
    const msgDiv = document.getElementById(elementId);
    if (msgDiv) {
        msgDiv.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
        // Автоматичне зникнення через 5 секунд
        setTimeout(() => {
            const alert = msgDiv.querySelector('.alert');
            if (alert) alert.remove();
        }, 5000);
    }
}

// Отримати поточного користувача
function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
}

// Перевірити, чи користувач залогінений
function isAuthenticated() {
    return getCurrentUser() !== null;
}

// ==================== ІНІЦІАЛІЗАЦІЯ ====================

document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
    checkAuth();
});