const API = 'http://localhost:5000/api';

let token = localStorage.getItem('token');
let username = localStorage.getItem('username');
let userCity = localStorage.getItem('userCity') || 'Санкт-Петербург';
let userGender = localStorage.getItem('userGender') || '';
let userAge = localStorage.getItem('userAge') || '';

function setAuth(t, u, city, gender, age) {
    token = t;
    username = u;
    userCity = city || 'Санкт-Петербург';
    userGender = gender || '';
    userAge = age || '';
    if (t) {
        localStorage.setItem('token', t);
        localStorage.setItem('username', u);
        localStorage.setItem('userCity', userCity);
        localStorage.setItem('userGender', userGender);
        localStorage.setItem('userAge', userAge);
    } else {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userCity');
        localStorage.removeItem('userGender');
        localStorage.removeItem('userAge');
    }
    updateAuthUI();
}

function updateAuthUI() {
    const btn = document.getElementById('auth-btn');
    if (token) {
        btn.textContent = username;
        btn.dataset.page = 'logout';
    } else {
        btn.textContent = 'Войти';
        btn.dataset.page = 'auth';
    }
}

function headers() {
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function api(path, method = 'GET', body = null) {
    const opts = { method, headers: headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API + path, opts);
    if (res.status === 401) { setAuth(null, null); showPage('welcome'); throw new Error('Не авторизован'); }
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Ошибка');
    }
    return res.json();
}

// Navigation
document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.page === 'logout') {
            setAuth(null, null);
            showPage('welcome');
            return;
        }
        showPage(btn.dataset.page);
    });
});

function showPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

    if ((name === 'wardrobe' || name === 'outfits' || name === 'recommend' || name === 'stats') && !token) {
        name = 'auth';
    }

    const page = document.getElementById(`page-${name}`);
    if (page) page.classList.remove('hidden');

    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    const navBtn = document.querySelector(`nav button[data-page="${name}"]`);
    if (navBtn) navBtn.classList.add('active');

    if (name === 'wardrobe') loadWardrobe();
    if (name === 'outfits') loadOutfits();
    if (name === 'stats') loadStats();
    if (name === 'recommend') { document.getElementById('rec-result').innerHTML = ''; document.getElementById('rec-city').value = userCity; loadRecommendHistory(); }
    if (name === 'auth') showAuthForm('login');
}

updateAuthUI();
showPage(token ? 'wardrobe' : 'welcome');
