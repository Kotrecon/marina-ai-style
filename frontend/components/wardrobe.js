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
            ${c.hasPhoto
                ? `<img class="card-photo" data-photo-id="${c.id}" alt="${c.name}">`
                : `<div class="card-photo-placeholder">📷</div>`}
            <h4>${c.name}</h4>
            <div class="meta">
                <span class="color-dot" style="background:${c.color}"></span>
                ${c.color} | ${c.category} | ${c.season}
            </div>
            <div class="meta">${c.style} | ${c.material || '—'}</div>
            <div class="meta">Надевали: ${c.wearCount} раз</div>
            <div class="card-actions">
                <label class="btn-photo">
                    📷 ${c.hasPhoto ? 'Заменить' : 'Добавить фото'}
                    <input type="file" accept="image/*" hidden onchange="uploadPhoto(${c.id}, this)">
                </label>
                <button class="btn-delete" onclick="deleteClothes(${c.id})">Удалить</button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.card-photo[data-photo-id]').forEach(loadCardPhoto);
}

async function loadCardPhoto(img) {
    const id = img.dataset.photoId;
    try {
        const res = await fetch(`${API}/clothes/${id}/photo`, { headers: headers() });
        if (res.ok) {
            const blob = await res.blob();
            img.src = URL.createObjectURL(blob);
        }
    } catch (e) {}
}

async function uploadPhoto(id, input) {
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch(`${API}/clothes/${id}/photo`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        if (!res.ok) throw new Error('Ошибка загрузки');
        loadWardrobe();
    } catch (e) {
        alert(e.message);
    }
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

    try {
        const result = await api('/clothes', 'POST', body);

        const photoInput = document.getElementById('c-photo');
        if (photoInput.files[0]) {
            const formData = new FormData();
            formData.append('file', photoInput.files[0]);
            await fetch(`${API}/clothes/${result.id}/photo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
        }

        document.getElementById('add-clothes-form').classList.add('hidden');
        photoInput.value = '';
        loadWardrobe();
    } catch (e) {
        alert(e.message);
    }
});

document.getElementById('filter-category').addEventListener('change', loadWardrobe);
document.getElementById('filter-season').addEventListener('change', loadWardrobe);
