document.addEventListener('DOMContentLoaded', () => {
    loadWatchlistDisplay();
});

function loadWatchlistDisplay() {
    const list = JSON.parse(localStorage.getItem('d4_watchlist') || '[]');
    const container = document.getElementById('watchlistGrid');

    if(list.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0; color: var(--muted);">
                <p>Your watchlist is empty.</p>
            </div>`;
        return;
    }

    container.innerHTML = list.map(movie => {
        return `
            <div class="movie-card" onclick="window.location.href='movie.html?id=${movie.id}'">
                <img src="https://image.tmdb.org/t/p/w342${movie.poster_path}" alt="${movie.title}" loading="lazy">
                <div class="card-overlay">
                    <h3 class="card-title">${movie.title}</h3>
                    <div class="card-meta">
                        <span class="rating"><i class="fas fa-star"></i> ${parseFloat(movie.vote_average).toFixed(1)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

