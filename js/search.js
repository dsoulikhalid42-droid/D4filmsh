const API_PROXY = '/tmdb';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    let timeout = null;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        const query = e.target.value.trim();
        if (query.length > 2) {
            timeout = setTimeout(() => {
                performSearch(query);
            }, 400);
        }
    });
});

async function performSearch(query) {
    const grid = document.getElementById('searchResultsGrid');
    if (!grid) return;

    grid.innerHTML = Array(6).fill(`
        <div class="movie-card">
            <div class="poster-box skeleton"></div>
            <div class="card-info">
                <div class="skeleton" style="height:14px; width:80%; border-radius:3px;"></div>
            </div>
        </div>
    `).join('');

    // استعمال search/multi باش يجيب الأفلام والمسلسلات ف دقة وحدة
    const data = await fetch(`${API_PROXY}?endpoint=search/multi&query=${encodeURIComponent(query)}`).then(res => res.json());

    if (!data || !data.results || data.results.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-gray); grid-column: 1/-1; text-align:center; padding: 20px;">No movies or TV shows found.</p>';
        return;
    }

    // تصفية النتائج باش نحيدو أسماء الممثلين ونخلو غير الأفلام والمسلسلات
    const filteredResults = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');

    grid.innerHTML = filteredResults.map(item => {
        const isTV = item.media_type === 'tv';
        const title = isTV ? item.name : item.title;
        const year = isTV ? (item.first_air_date ? item.first_air_date.split('-')[0] : '2026') : (item.release_date ? item.release_date.split('-')[0] : '2026');
        const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : 'https://via.placeholder.com/342x500?text=No+Poster';
        
        return `
            <div class="movie-card" onclick="window.location.href='movie.html?id=${item.id}&type=${item.media_type}'">
                <div class="poster-box" style="background-image: url('${poster}')">
                    <div class="hd-tag">HD</div>
                </div>
                <div class="card-info">
                    <div class="card-meta">
                        <span>${year}</span>
                        <span>• ${isTV ? 'TV Show' : 'Movie'}</span>
                    </div>
                    <div class="card-title">${title}</div>
                </div>
            </div>
        `;
    }).join('');
}
