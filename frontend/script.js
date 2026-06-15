const API = 'http://localhost:5000/api';

let token = localStorage.getItem('token');
let username = localStorage.getItem('username');

function setAuth(t, u) {
    token = t;
    username = u;
    if (t) {
        localStorage.setItem('token', t);
        localStorage.setItem('username', u);
    } else {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
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
    if (res.status === 401) { setAuth(null, null); throw new Error('Не авторизован'); }
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
            showPage('wardrobe');
            return;
        }
        showPage(btn.dataset.page);
    });
});

function showPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const page = document.getElementById(`page-${name}`);
    if (page) page.classList.remove('hidden');

    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    const navBtn = document.querySelector(`nav button[data-page="${name}"]`);
    if (navBtn) navBtn.classList.add('active');

    if (name === 'wardrobe') loadWardrobe();
    if (name === 'outfits') loadOutfits();
    if (name === 'stats') loadStats();
    if (name === 'auth') showAuthForm('login');
}

updateAuthUI();
showPage('wardrobe');
