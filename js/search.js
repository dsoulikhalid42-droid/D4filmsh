document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('catalogSearch');
    let debounceTimer;

    input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        if (query.length < 2) return;

        debounceTimer = setTimeout(() => {
            performCatalogSearch(query);
        }, 500);
    });
});

async function performCatalogSearch(query) {
    const data = await callProxy('search/movie', { query });
    const grid = document.getElementById('searchGrid');
    if (data && data.results) {
        grid.innerHTML = data.results.map(movie => `
            <div class="poster-card" onclick="window.location.href='movie.html?id=${movie.id}'">
                <div class="poster-wrapper" style="background-image: url('https://image.tmdb.org/t/p/w342${movie.poster_path}')">
                    <div class="hd-ribbon">HD</div>
                </div>
                <div class="card-details">
                    <div class="card-meta-line">
                        <span>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</span>
                    </div>
                    <div class="card-title">${movie.title}</div>
                </div>
            </div>
        `).join('');
    }
}
