let currentWeather = null;

document.getElementById('weather-btn').addEventListener('click', loadWeather);

document.getElementById('rec-city').addEventListener('change', async (e) => {
    const city = e.target.value.trim();
    if (city && token) {
        try {
            await api('/auth/city', 'PUT', { city });
            userCity = city;
            localStorage.setItem('userCity', city);
        } catch (err) {}
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('rec-city').value = userCity;
});

async function loadWeather() {
    const city = document.getElementById('rec-city').value.trim();
    if (!city) return;

    const info = document.getElementById('weather-info');
    info.textContent = 'Загрузка...';

    try {
        const data = await api(`/recommend/weather?city=${encodeURIComponent(city)}`);
        currentWeather = data;
        info.innerHTML = `
            <div class="weather-info-row">
                <div class="weather-info-item">🌡️ ${data.temperature}°C</div>
                <div class="weather-info-item">☁️ ${data.description}</div>
                <div class="weather-info-item">💧 ${data.humidity}%</div>
                <div class="weather-info-item">💨 ${data.windSpeed} м/с</div>
                <div class="weather-info-item">🌧️ ${data.precipitationChance}%</div>
            </div>
            <div class="meta" style="margin-top:0.3rem">${data.city}: от ${data.tempMin}°C до ${data.tempMax}°C</div>
        `;
    } catch (e) {
        info.textContent = 'Ошибка: ' + e.message;
        currentWeather = null;
    }
}

document.getElementById('rec-submit').addEventListener('click', async () => {
    if (!token) {
        alert('Войдите в аккаунт');
        showPage('auth');
        return;
    }

    const city = document.getElementById('rec-city').value.trim() || 'Санкт-Петербург';
    const season = document.getElementById('rec-season').value;
    const style = document.getElementById('rec-style').value || null;
    const occasion = document.getElementById('rec-occasion').value || null;
    const result = document.getElementById('rec-result');

    result.textContent = 'Загрузка...';

    try {
        const data = await api('/recommend', 'POST', { city, season, style, occasion, gender: userGender || undefined, age: userAge ? parseInt(userAge) : undefined });
        renderRecommendation(data);
        loadRecommendHistory();
    } catch (e) {
        result.textContent = 'Ошибка: ' + e.message;
    }
});

function renderRecommendation(data) {
    const result = document.getElementById('rec-result');
    let html = '';

    if (data.weather) {
        html += `<div class="meta" style="margin-bottom:0.5rem">📍 ${data.weather.city}: ${data.weather.temperature}°C, ${data.weather.description}</div>`;
    }

    html += '<h3>Рекомендация:</h3>';

    if (data.items && data.items.length > 0) {
        html += '<ul>' + data.items.map(i =>
            `<li><strong>${i.name}</strong> — ${i.category}, ${i.color}, ${i.season}</li>`
        ).join('') + '</ul>';
    }

    html += `<p style="margin-top:1rem;color:#666">${data.advice}</p>`;
    result.innerHTML = html;
}

async function loadRecommendHistory() {
    if (!token) return;
    try {
        const items = await api('/recommend');
        const list = document.getElementById('rec-history');
        if (!items.length) {
            list.innerHTML = '';
            return;
        }
        list.innerHTML = '<h3>История рекомендаций</h3>' +
            items.map(r => `
                <div class="card" style="margin-bottom:0.5rem">
                    <div class="meta">${r.city || '—'} | ${r.season} | ${r.occasion || '—'} | ${new Date(r.createdAt).toLocaleDateString('ru')}</div>
                    <div class="meta" style="white-space:pre-wrap">${r.advice}</div>
                </div>
            `).join('');
    } catch (e) {}
}
