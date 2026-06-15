async function loadOutfits() {
    if (!token) return;
    try {
        const items = await api('/outfit');
        renderOutfits(items);
    } catch (e) {
        console.error(e);
    }
}

function renderOutfits(items) {
    const list = document.getElementById('outfits-list');
    list.innerHTML = items.map(o => `
        <div class="card">
            <h4>${o.name}</h4>
            <div class="meta">${o.occasion}</div>
            <div class="meta">Вещей: ${o.items.length}</div>
            <div class="meta">${o.items.map(i => i.name).join(', ')}</div>
            <button onclick="deleteOutfit(${o.id})">Удалить</button>
        </div>
    `).join('');
}

async function deleteOutfit(id) {
    if (!confirm('Удалить outfit?')) return;
    await api(`/outfit/${id}`, 'DELETE');
    loadOutfits();
}

document.getElementById('add-outfit-btn').addEventListener('click', async () => {
        const name = prompt('Название образа:');
        if (!name) return;
        const occasion = prompt('Повод:');
    if (!occasion) return;

    const clothesStr = prompt('ID вещей через запятую (например: 1,2,3):');
    if (!clothesStr) return;
    const clothesIds = clothesStr.split(',').map(Number).filter(n => !isNaN(n));

    try {
        await api('/outfit', 'POST', { name, occasion, clothesIds });
        loadOutfits();
    } catch (e) {
        alert(e.message);
    }
});
