let authMode = 'login';

function showAuthForm(mode) {
    authMode = mode;
    const title = document.getElementById('auth-title');
    const submit = document.getElementById('auth-submit');
    const toggle = document.getElementById('auth-toggle');
    const error = document.getElementById('auth-error');

    error.textContent = '';

    if (mode === 'login') {
        title.textContent = 'Вход';
        submit.textContent = 'Войти';
        toggle.innerHTML = 'Нет аккаунта? <a id="auth-switch">Зарегистрироваться</a>';
    } else {
        title.textContent = 'Регистрация';
        submit.textContent = 'Зарегистрироваться';
        toggle.innerHTML = 'Есть аккаунт? <a id="auth-switch">Войти</a>';
    }

    document.getElementById('auth-switch').addEventListener('click', (e) => {
        e.preventDefault();
        showAuthForm(mode === 'login' ? 'register' : 'login');
    });
}

document.getElementById('auth-submit').addEventListener('click', async () => {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    const error = document.getElementById('auth-error');

    if (!username || !password) {
        error.textContent = 'Заполните все поля';
        return;
    }

    try {
        const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
        const data = await api(endpoint, 'POST', { username, password, city: userCity, gender: userGender || undefined, age: userAge ? parseInt(userAge) : undefined });
        setAuth(data.token, data.username, data.city, data.gender, data.age);
        showPage('wardrobe');
    } catch (e) {
        error.textContent = e.message;
    }
});
