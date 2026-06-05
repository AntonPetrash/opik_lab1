// Сторінка входу - обробка форми

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Отримуємо значення з полів форми
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    
    // Очищаємо попередні повідомлення
    if (messageDiv) messageDiv.innerHTML = '';
    
    // Валідація: перевіряємо, чи поля не пусті
    if (!email || !password) {
        if (messageDiv) {
            messageDiv.innerHTML = '<div class="alert alert-danger">Будь ласка, заповніть всі поля</div>';
        }
        return;
    }
    
    try {
        // Шукаємо користувача з таким email на сервері
        const res = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`);
        
        if (!res.ok) {
            throw new Error('Помилка з\'єднання з сервером');
        }
        
        const users = await res.json();
        
        // Перевіряємо, чи існує користувач і чи правильний пароль
        const user = users.find(u => u.password === password);
        
        if (!user) {
            if (messageDiv) {
                messageDiv.innerHTML = '<div class="alert alert-danger">Невірний email або пароль</div>';
            }
            return;
        }
        
        // Успішний вхід: зберігаємо користувача в sessionStorage
        // Видаляємо пароль перед збереженням (безпека)
        const { password: _, ...safeUser } = user;
        sessionStorage.setItem('currentUser', JSON.stringify(safeUser));
        
        // Показуємо повідомлення про успіх
        if (messageDiv) {
            messageDiv.innerHTML = '<div class="alert alert-success">Вхід виконано успішно! Перенаправлення...</div>';
        }
        
        // Перенаправляємо на сторінку з таймерами через 1 секунду
        setTimeout(() => {
            window.location.href = 'timers.html';
        }, 1000);
        
    } catch (err) {
        console.error('Помилка входу:', err);
        if (messageDiv) {
            messageDiv.innerHTML = '<div class="alert alert-danger">Помилка з\'єднання з сервером. Переконайтеся, що json-server запущено (npm run server).</div>';
        }
    }
});

// Додаткова функція: перевірка, чи користувач вже залогінений
// Якщо так - одразу перенаправляємо на сторінку таймерів
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        // Якщо користувач вже залогінений, перенаправляємо на сторінку таймерів
        window.location.href = 'timers.html';
    }
});