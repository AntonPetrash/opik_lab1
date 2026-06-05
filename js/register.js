// Сторінка реєстрації - обробка форми

// Функція для відображення повідомлень
function showRegisterMessage(message, type) {
    const msgDiv = document.getElementById('registerMessage');
    if (msgDiv) {
        msgDiv.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
        setTimeout(() => {
            const alert = msgDiv.querySelector('.alert');
            if (alert) alert.remove();
        }, 5000);
    }
}

// Валідація дати народження
function isValidAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 18;
}

// Валідація email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
}

// Обробка форми реєстрації
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const gender = document.getElementById('gender').value;
    const dob = document.getElementById('dob').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    
    const messageDiv = document.getElementById('registerMessage');
    if (messageDiv) messageDiv.innerHTML = '';
    
    // Валідація
    if (!name || !email || !gender || !dob || !password) {
        showRegisterMessage('Будь ласка, заповніть всі поля', 'danger');
        return;
    }
    
    if (confirmPassword !== undefined && password !== confirmPassword) {
        showRegisterMessage('Паролі не співпадають', 'danger');
        return;
    }
    
    if (!isValidEmail(email)) {
        showRegisterMessage('Введіть коректний email', 'danger');
        return;
    }
    
    if (!isValidAge(dob)) {
        showRegisterMessage('Ви повинні бути старшими 18 років', 'danger');
        return;
    }
    
    if (password.length < 4) {
        showRegisterMessage('Пароль повинен містити не менше 4 символів', 'danger');
        return;
    }
    
    try {
        // Перевірка чи email існує
        const checkRes = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`);
        const existing = await checkRes.json();
        
        if (existing.length > 0) {
            showRegisterMessage('Користувач з таким email вже існує', 'danger');
            return;
        }
        
        const newUser = {
            name,
            email,
            gender,
            dob,
            password,
            createdAt: new Date().toISOString()
        };
        
        // Відправляємо POST запит на сервер (ВИПРАВЛЕНО)
        const res = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });
        
        if (!res.ok) {
            throw new Error('Помилка сервера при реєстрації');
        }
        
        const user = await res.json();
        const { password: _, ...safeUser } = user;
        sessionStorage.setItem('currentUser', JSON.stringify(safeUser));
        
        showRegisterMessage('Реєстрація успішна! Перенаправлення...', 'success');
        setTimeout(() => {
            window.location.href = 'timers.html';
        }, 1500);
        
    } catch (err) {
        console.error('Помилка:', err);
        showRegisterMessage('Помилка з\'єднання з сервером. Запустіть json-server.', 'danger');
    }
});

// Перевірка чи користувач вже залогінений
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        window.location.href = 'timers.html';
    }
});