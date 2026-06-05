// Базовий URL для API (json-server)
const API_BASE = 'http://localhost:3000';

// Реєстрація нового користувача
async function registerUser(userData) {
    const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error('Помилка реєстрації');
    return res.json();
}

// Вхід користувача (пошук за email та паролем)
async function loginUser(email, password) {
    const res = await fetch(`${API_BASE}/users?email=${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error('Помилка запиту до сервера');
    const users = await res.json();
    const user = users.find(u => u.password === password);
    if (!user) throw new Error('Невірний email або пароль');
    return user;
}

// Отримання профілю користувача за ID
async function getUserById(userId) {
    const res = await fetch(`${API_BASE}/users/${userId}`);
    if (!res.ok) throw new Error('Користувача не знайдено');
    return res.json();
}

// Отримати всі таймери користувача
async function fetchTimers(userId) {
    const res = await fetch(`${API_BASE}/timers?userId=${userId}&_sort=startTime&_order=desc`);
    if (!res.ok) throw new Error('Не вдалося завантажити таймери');
    return res.json();
}

// Створити новий таймер
async function createTimer(userId, name, startTime, endTime) {
    const newTimer = {
        userId: userId,
        name: name,
        startTime: startTime,      // ISO рядок (наприклад, "2026-06-05T15:30:00")
        endTime: endTime,          // ISO рядок
        status: 'waiting',         // waiting, active, completed, expired
        createdAt: new Date().toISOString()
    };
    
    const res = await fetch(`${API_BASE}/timers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTimer)
    });
    if (!res.ok) throw new Error('Помилка створення таймера');
    return res.json();
}

// Оновити таймер (наприклад, статус або час)
async function updateTimer(timerId, updates) {
    const res = await fetch(`${API_BASE}/timers/${timerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Помилка оновлення таймера');
    return res.json();
}

// Видалити таймер
async function deleteTimer(timerId) {
    const res = await fetch(`${API_BASE}/timers/${timerId}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Помилка видалення таймера');
    return true;
}

// Отримати один таймер за ID
async function getTimerById(timerId) {
    const res = await fetch(`${API_BASE}/timers/${timerId}`);
    if (!res.ok) throw new Error('Таймер не знайдено');
    return res.json();
}


// Перевірка статусу таймера на основі поточного часу
function calculateTimerStatus(startTime, endTime) {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) return 'waiting';      // Ще не почався
    if (now >= start && now <= end) return 'active';   // Активний
    if (now > end) return 'completed';      // Завершився
    return 'expired';
}

// Розрахунок часу, що залишився (в мілісекундах)
function getRemainingTime(endTime) {
    const now = new Date();
    const end = new Date(endTime);
    const remaining = end - now;
    return remaining > 0 ? remaining : 0;
}

// Форматування часу в мм:сс (для відображення)
function formatTimeRemaining(ms) {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Форматування дати для відображення
function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('uk-UA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}