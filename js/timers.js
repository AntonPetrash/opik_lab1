// ==================== ГЛОБАЛЬНІ ЗМІННІ ====================
let currentUser = null;
let timers = [];

// ==================== ЗАВАНТАЖЕННЯ КОРИСТУВАЧА ====================
async function loadUser() {
    const userStr = sessionStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'login.html';
        return;
    }
    currentUser = JSON.parse(userStr);
    console.log('Користувач завантажений:', currentUser);
    await loadTimers();
}

// ==================== ЗАВАНТАЖЕННЯ ТАЙМЕРІВ ====================
async function loadTimers() {
    try {
        const res = await fetch(`http://localhost:3000/timers?userId=${currentUser.id}`);
        if (!res.ok) throw new Error('Помилка завантаження');
        timers = await res.json();
        console.log('Завантажено таймерів:', timers.length);
        renderTimers();
        updateStats();
    } catch (err) {
        console.error('Помилка:', err);
        document.getElementById('timersList').innerHTML = '<div class="alert alert-danger">Помилка завантаження. Переконайтеся, що сервер запущено (npm run server)</div>';
    }
}

// ==================== ВІДОБРАЖЕННЯ ТАЙМЕРІВ ====================
function renderTimers() {
    const container = document.getElementById('timersList');
    if (!container) return;
    
    if (timers.length === 0) {
        container.innerHTML = '<div class="alert alert-info text-center">📭 У вас поки немає таймерів. Створіть свій перший таймер!</div>';
        return;
    }
    
    let html = '<div class="row">';
    timers.forEach(timer => {
        const startDate = new Date(timer.startTime);
        const endDate = new Date(timer.endTime);
        
        html += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${escapeHtml(timer.name)}</h5>
                        <p class="card-text small">
                            <strong>Старт:</strong> ${startDate.toLocaleString('uk-UA')}<br>
                            <strong>Фініш:</strong> ${endDate.toLocaleString('uk-UA')}<br>
                            <strong>Статус:</strong> ${getStatusText(timer.status)}
                        </p>
                        <button class="btn btn-sm btn-warning" onclick="editTimer('${timer.id}')">✏️ Редагувати</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteTimer('${timer.id}')">🗑️ Видалити</button>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function getStatusText(status) {
    switch(status) {
        case 'active': return '▶ Активний';
        case 'completed': return '✓ Завершено';
        case 'waiting': return '⏳ Очікує';
        default: return 'Невідомо';
    }
}

function updateStats() {
    const total = timers.length;
    const active = timers.filter(t => t.status === 'active').length;
    const waiting = timers.filter(t => t.status === 'waiting').length;
    const completed = timers.filter(t => t.status === 'completed').length;
    
    document.getElementById('totalCount') && (document.getElementById('totalCount').innerText = total);
    document.getElementById('activeCount') && (document.getElementById('activeCount').innerText = active);
    document.getElementById('waitingCount') && (document.getElementById('waitingCount').innerText = waiting);
    document.getElementById('completedCount') && (document.getElementById('completedCount').innerText = completed);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ==================== СТВОРЕННЯ ТАЙМЕРА (ПЕРЕПИСАНО) ====================
function openModal() {
    document.getElementById('timerId').value = '';
    document.getElementById('timerName').value = '';
    document.getElementById('timerStartDate').value = '';
    document.getElementById('timerStartTime').value = '';
    document.getElementById('timerEndDate').value = '';
    document.getElementById('timerEndTime').value = '';
    document.getElementById('modalTitle').innerText = 'Створити новий таймер';
    new bootstrap.Modal(document.getElementById('timerModal')).show();
}

async function saveTimer() {
    console.log('saveTimer викликано');
    
    const id = document.getElementById('timerId').value;
    const name = document.getElementById('timerName').value.trim();
    const startDate = document.getElementById('timerStartDate').value;
    const startTime = document.getElementById('timerStartTime').value;
    const endDate = document.getElementById('timerEndDate').value;
    const endTime = document.getElementById('timerEndTime').value;
    
    // Валідація
    if (!name) {
        alert('Введіть назву таймера');
        return;
    }
    
    if (!startDate || !startTime) {
        alert('Введіть дату та час старту');
        return;
    }
    
    if (!endDate || !endTime) {
        alert('Введіть дату та час завершення');
        return;
    }
    
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    if (startDateTime >= endDateTime) {
        alert('Час старту повинен бути раніше за час завершення');
        return;
    }
    
    try {
        if (id) {
            // РЕДАГУВАННЯ
            console.log('Редагування таймера з ID:', id);
            const updatedTimer = {
                ...timers.find(t => t.id == id),
                name: name,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString()
            };
            const res = await fetch(`http://localhost:3000/timers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTimer)
            });
            if (!res.ok) throw new Error('Помилка оновлення');
            console.log('Таймер оновлено');
        } else {
            // СТВОРЕННЯ НОВОГО ТАЙМЕРА
            const newTimer = {
                userId: currentUser.id,
                name: name,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                status: 'waiting',
                createdAt: new Date().toISOString()
            };
            
            console.log('Надсилаємо на сервер:', JSON.stringify(newTimer, null, 2));
            
            const res = await fetch('http://localhost:3000/timers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTimer)
            });
            
            console.log('Статус відповіді:', res.status);
            
            if (!res.ok) {
                const errorText = await res.text();
                console.error('Помилка сервера:', errorText);
                throw new Error('Помилка створення: ' + res.status);
            }
            
            const result = await res.json();
            console.log('Таймер створено:', result);
        }
        
        // Закриваємо модальне вікно
        const modal = bootstrap.Modal.getInstance(document.getElementById('timerModal'));
        if (modal) modal.hide();
        
        // Перезавантажуємо список
        await loadTimers();
        
    } catch (err) {
        console.error('Помилка в saveTimer:', err);
        alert('Помилка: ' + err.message + '\n\nПереконайтеся, що сервер запущено (npm run server)');
    }
}

// ==================== ВИДАЛЕННЯ ТАЙМЕРА ====================
async function deleteTimer(id) {
    if (!confirm('Видалити цей таймер?')) return;
    
    try {
        const res = await fetch(`http://localhost:3000/timers/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Помилка видалення');
        console.log('Таймер видалено');
        await loadTimers();
    } catch (err) {
        console.error('Помилка видалення:', err);
        alert('Помилка видалення: ' + err.message);
    }
}

// ==================== РЕДАГУВАННЯ ТАЙМЕРА ====================
function editTimer(id) {
    const timer = timers.find(t => t.id == id);
    if (!timer) return;
    
    const startDate = new Date(timer.startTime);
    const endDate = new Date(timer.endTime);
    
    document.getElementById('timerId').value = timer.id;
    document.getElementById('timerName').value = timer.name;
    document.getElementById('timerStartDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('timerStartTime').value = startDate.toTimeString().slice(0, 5);
    document.getElementById('timerEndDate').value = endDate.toISOString().split('T')[0];
    document.getElementById('timerEndTime').value = endDate.toTimeString().slice(0, 5);
    document.getElementById('modalTitle').innerText = 'Редагувати таймер';
    
    new bootstrap.Modal(document.getElementById('timerModal')).show();
}

// ==================== ІНІЦІАЛІЗАЦІЯ ====================
window.openModal = openModal;
window.saveTimer = saveTimer;
window.editTimer = editTimer;
window.deleteTimer = deleteTimer;

document.addEventListener('DOMContentLoaded', () => {
    loadUser();
});