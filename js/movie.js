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

async function loadMovieDetails(id) {
    const movie = await fetch(`${API_PROXY}?endpoint=movie/${id}`).then(res => res.json());
    if (!movie) return;

    // ركب السيرفر الأول كـ سيرفر رئيسي تلقائي واحترافي
    changeServer(1, id);

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
            <span>Movie</span>
        </div>
        <p class="movie-story">${movie.overview || 'No overview available.'}</p>
        <div class="movie-sub-meta"><strong>Type:</strong> Movie</div>
        <div class="movie-sub-meta"><strong>Genre:</strong> ${genres}</div>
    `;

    // تعويض أزرار الأكشن التحت بـ أزرار تحويل السيرفرات الشغالة
    const btnContainer = document.querySelector('.player-buttons');
    if (btnContainer) {
        btnContainer.innerHTML = `
            <button class="btn-player-action" onclick="changeServer(1, '${id}')" style="border-color:#00b4d8;"><i class="fa-solid fa-server"></i> Server 1 (Vidsrc)</button>
            <button class="btn-player-action" onclick="changeServer(2, '${id}')" style="border-color:#ffb703;"><i class="fa-solid fa-server"></i> Server 2 (SuperEmbed)</button>
        `;
    }

    // جلب المقترحات التحت
    const recommendations = await fetch(`${API_PROXY}?endpoint=movie/${id}/recommendations`).then(res => res.json());
    if (recommendations && recommendations.results) {
        renderRecommendedList(recommendations.results.slice(0, 6));
    }
}

// دالة سحرية لتبديل السيرفرات بـ IDs آمنة وسريعة
function changeServer(serverNum, id) {
    const playerWrapper = document.querySelector('.video-player-wrapper');
    if (!playerWrapper) return;

    let embedUrl = '';
    if (serverNum === 1) {
        embedUrl = `https://vidsrc.cc/v2/embed/movie/${id}`;
    } else {
        embedUrl = `https://multiembed.mov/?video_id=${id}&tmdb=1`;
    }

    playerWrapper.innerHTML = `
        <iframe src="${embedUrl}" allowfullscreen style="width:100%; height:100%; border:none;"></iframe>
    `;
}

function renderRecommendedList(movies) {
    const container = document.getElementById('recommendedList');
    if (!container) return;

    container.innerHTML = movies.map(movie => {
        const year = movie.release_date ? movie.release_date.split('-')[0] : '2026';
        const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : 'https://via.placeholder.com/185x278?text=No+Poster';
        
        return `
            <div class="rec-item-row" onclick="window.location.href='movie.html?id=${movie.id}'">
                <div class="rec-thumb" style="background-image: url('${poster}')"></div>
                <div class="rec-text-side">
                    <div class="rec-meta-line">Movie • ${year}</div>
                    <div class="rec-movie-title">${movie.title}</div>
                </div>
            </div>
        `;
    }).join('');
}
