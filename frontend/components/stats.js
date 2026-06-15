async function loadStats() {
    if (!token) return;

    try {
        const data = await api('/stats');
        renderStats(data);
    } catch (e) {
        console.error(e);
    }
}

function renderStats(data) {
    const content = document.getElementById('stats-content');
    content.innerHTML = `
        <div class="stat-card">
            <h3>Всего вещей</h3>
            <div class="value">${data.totalClothes}</div>
        </div>
        <div class="stat-card">
            <h3>Образы</h3>
            <div class="value">${data.totalOutfits}</div>
        </div>
        <div class="stat-card">
            <h3>Надевали</h3>
            <div class="value">${data.totalWears} раз</div>
        </div>
        <div class="stat-card">
            <h3>По категориям</h3>
            ${data.byCategory.map(s => `<div>${s.category}: ${s.count}</div>`).join('')}
        </div>
        <div class="stat-card">
            <h3>По сезонам</h3>
            ${data.bySeason.map(s => `<div>${s.season}: ${s.count}</div>`).join('')}
        </div>
        <div class="stat-card">
            <h3>По цветам</h3>
            ${data.byColor.map(s => `<div><span class="color-dot" style="background:${s.color}"></span>${s.color}: ${s.count}</div>`).join('')}
        </div>
    `;
}
