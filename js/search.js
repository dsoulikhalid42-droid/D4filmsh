const API_PROXY = '/tmdb';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    
    // البحث الفوري عند الكتابة مع تأخير بسيط (Debounce)
    let timeout = null;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        const query = e.target.value.trim();
        if (query.length > 2) {
            timeout = setTimeout(() => {
                performSearch(query);
            }, 500);
        }
    });
});

async function performSearch(query) {
    const grid = document.getElementById('searchResultsGrid');
    if (!grid) return;

    // إظهار السكيلتون مؤقتاً أثناء البحث
    grid.innerHTML = Array(6).fill(`
        <div class="movie-card">
            <div class="poster-box skeleton"></div>
            <div class="card-info">
                <div class="skeleton" style="height:12px; width:40%; margin-bottom:6px; border-radius:3px;"></div>
                <div class="skeleton" style="height:14px; width:80%; border-radius:3px;"></div>
            </div>
        </div>
    `).join('');

    const data = await fetch(`${API_PROXY}?endpoint=search/movie&query=${encodeURIComponent(query)}`).then(res => res.json());

    if (!data || !data.results || data.results.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-gray); grid-column: 1/-1; text-align:center; padding: 20px;">No movies found matching your search.</p>';
        return;
    }

    // رندرة النتائج بـ الديزاين الاحترافي
    grid.innerHTML = data.results.map(movie => {
        const year = movie.release_date ? movie.release_date.split('-')[0] : '2026';
        const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : 'https://via.placeholder.com/342x500?text=No+Poster';
        
        return `
            <div class="movie-card" onclick="window.location.href='movie.html?id=${movie.id}'">
                <div class="poster-box" style="background-image: url('${poster}')">
                    <div class="hd-tag">HD</div>
                </div>
                <div class="card-info">
                    <div class="card-meta">
                        <span>${year}</span>
                        <span>• Movie</span>
                    </div>
                    <div class="card-title">${movie.title}</div>
                </div>
            </div>
        `;
    }).join('');
}
