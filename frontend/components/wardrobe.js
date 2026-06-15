async function loadWardrobe() {
    if (!token) return;
    const category = document.getElementById('filter-category').value;
    const season = document.getElementById('filter-season').value;

    let url = '/clothes?';
    if (category) url += `category=${category}&`;
    if (season) url += `season=${season}&`;

    try {
        const items = await api(url);
        renderClothes(items);
    } catch (e) {
        console.error(e);
    }
}

function renderClothes(items) {
    const list = document.getElementById('clothes-list');
    list.innerHTML = items.map(c => `
        <div class="card">
            <h4>${c.name}</h4>
            <div class="meta">
                <span class="color-dot" style="background:${c.color}"></span>
                ${c.color} | ${c.category} | ${c.season}
            </div>
            <div class="meta">${c.style} | ${c.material || '—'}</div>
            <div class="meta">Надевали: ${c.wearCount} раз</div>
            <button onclick="deleteClothes(${c.id})">Удалить</button>
        </div>
    `).join('');
}

async function deleteClothes(id) {
    if (!confirm('Удалить вещь?')) return;
    await api(`/clothes/${id}`, 'DELETE');
    loadWardrobe();
}

document.getElementById('add-clothes-btn').addEventListener('click', () => {
    document.getElementById('add-clothes-form').classList.remove('hidden');
});

document.getElementById('c-cancel').addEventListener('click', () => {
    document.getElementById('add-clothes-form').classList.add('hidden');
});

document.getElementById('c-submit').addEventListener('click', async () => {
    const body = {
        name: document.getElementById('c-name').value,
        category: document.getElementById('c-category').value,
        color: document.getElementById('c-color').value,
        material: document.getElementById('c-material').value,
        season: document.getElementById('c-season').value,
        style: document.getElementById('c-style').value
    };

    if (!body.name || !body.color) {
        alert('Заполните название и цвет');
        return;
    }

    await api('/clothes', 'POST', body);
    document.getElementById('add-clothes-form').classList.add('hidden');
    loadWardrobe();
});

document.getElementById('filter-category').addEventListener('change', loadWardrobe);
document.getElementById('filter-season').addEventListener('change', loadWardrobe);
