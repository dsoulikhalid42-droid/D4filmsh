const API_PROXY = '/tmdb';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    
    if (movieId) {
        loadMovieDetails(movieId);
    } else {
        window.location.href = 'index.html';
    }
});

async function callProxy(endpoint, additionalParams = {}) {
    const queryParams = new URLSearchParams({ endpoint, ...additionalParams });
    try {
        const response = await fetch(`${API_PROXY}?${queryParams.toString()}`);
        return await response.json();
    } catch (err) {
        console.error("Proxy failure:", err);
        return null;
    }
}

async function loadMovieDetails(id) {
    // 1. جلب بيانات الفيلم
    const movie = await callProxy(`movie/${id}`);
    if (!movie) return;

    // 2. تركيب المشغل مجاناً (Embed Player)
    const playerWrapper = document.querySelector('.video-player-wrapper');
    playerWrapper.innerHTML = `
        <iframe src="https://vidsrc.to/embed/movie/${id}" allowfullscreen></iframe>
    `;

    // 3. تعبئة نصوص التفاصيل
    const detailsContainer = document.getElementById('movieDetailsContainer');
    const year = movie.release_date ? movie.release_date.split('-')[0] : '2026';
    const genres = movie.genres ? movie.genres.map(g => g.name).join(', ') : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '7.5';

    detailsContainer.innerHTML = `
        <h1 class="movie-main-title">${movie.title}</h1>
        <div class="hero-meta" style="margin-bottom:10px;">
            <span class="badge-cyan">4K</span>
            <span class="badge-outline">TV-MA</span>
            <span><i class="fa-solid fa-star rating-star"></i> ${rating}</span>
            <span>${year}</span>
            <span>1h 45min</span>
        </div>
        <p class="movie-story">${movie.overview || 'No overview available for this movie.'}</p>
        <div class="movie-sub-meta"><strong>Type:</strong> Movie</div>
        <div class="movie-sub-meta"><strong>Genre:</strong> ${genres}</div>
    `;

    // 4. جلب الأفلام المقترحة ورندرتها على شكل أسطر احترافية
    const recommendations = await callProxy(`movie/${id}/recommendations`);
    if (recommendations && recommendations.results) {
        renderRecommendedList(recommendations.results.slice(0, 6)); // جلب أفضل 6 مقترحات
    }
}

function renderRecommendedList(movies) {
    const container = document.getElementById('recommendedList');
    if (!container) return;

    if (movies.length === 0) {
        container.innerHTML = '<p style="color:var(--text-gray); padding:0 5%;">No recommendations found.</p>';
        return;
    }

    container.innerHTML = movies.map(movie => {
        const year = movie.release_date ? movie.release_date.split('-')[0] : '2026';
        const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : 'https://via.placeholder.com/185x278?text=No+Poster';
        
        return `
            <div class="rec-item-row" onclick="window.location.href='movie.html?id=${movie.id}'">
                <div class="rec-thumb" style="background-image: url('${poster}')"></div>
                <div class="rec-text-side">
                    <div class="rec-meta-line">Movie • ${year} • 120 min</div>
                    <div class="rec-movie-title">${movie.title}</div>
                </div>
            </div>
        `;
    }).join('');
}
