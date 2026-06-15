document.getElementById('rec-submit').addEventListener('click', async () => {
    if (!token) {
        alert('Войдите в аккаунт');
        showPage('auth');
        return;
    }

    const season = document.getElementById('rec-season').value;
    const occasion = document.getElementById('rec-occasion').value || null;
    const result = document.getElementById('rec-result');

    result.textContent = 'Загрузка...';

    try {
        const data = await api('/recommend', 'POST', { season, occasion });
        let html = '<h3>Рекомендация:</h3>';

        if (data.items.length > 0) {
            html += '<ul>' + data.items.map(i =>
                `<li><strong>${i.name}</strong> — ${i.category}, ${i.color}, ${i.season}</li>`
            ).join('') + '</ul>';
        }

        html += `<p style="margin-top:1rem;color:#666">${data.advice}</p>`;
        result.innerHTML = html;
    } catch (e) {
        result.textContent = 'Ошибка: ' + e.message;
    }
});
