const API_PROXY = '/functions/tmdb';

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('mainHero')) {
        initHomePage();
    }
});

async function callProxy(endpoint, additionalParams = {}) {
    const queryParams = new URLSearchParams({ endpoint, ...additionalParams });
    try {
        const response = await fetch(`${API_PROXY}?${queryParams.toString()}`);
        return await response.json();
    } catch (err) {
        console.error("Proxy integration failed", err);
        return null;
    }
}

async function initHomePage() {
    // Skeletons
    document.getElementById('trendingContainer').innerHTML = Array(4).fill('<div class="trending-card skeleton-box"></div>').join('');
    document.getElementById('recommendedGrid').innerHTML = Array(6).fill('<div class="poster-card" style="height:280px;"><div class="poster-wrapper skeleton-box"></div></div>').join('');

    const trendingData = await callProxy('trending/movie/day');
    if (trendingData && trendingData.results.length > 0) {
        setupHero(trendingData.results[0]);
        renderTrendingTrack(trendingData.results.slice(0, 10));
    }

    const popularData = await callProxy('movie/popular');
    if (popularData) {
        renderRecommendedGrid(popularData.results);
    }
}

function setupHero(movie) {
    const hero = document.getElementById('mainHero');
    hero.style.backgroundImage = `url('https://image.tmdb.org/t/p/original${movie.backdrop_path}')`;
    
    document.getElementById('heroDetails').innerHTML = `
        <h1 class="hero-title">${movie.title}</h1>
        <div class="hero-meta-row">
            <span class="badge-cyan">4K</span>
            <span class="badge-outline">TV-MA</span>
            <span><i class="fa-solid fa-star rating-star"></i> ${movie.vote_average.toFixed(1)}</span>
            <span>${movie.release_date.split('-')[0]}</span>
        </div>
        <button class="btn-watch" onclick="window.location.href='movie.html?id=${movie.id}'">
            <i class="fa-solid fa-circle-play"></i> Watch Now
        </button>
    `;
}

function renderTrendingTrack(movies) {
    const container = document.getElementById('trendingContainer');
    container.innerHTML = movies.map(movie => `
        <div class="trending-card" style="background-image: url('https://image.tmdb.org/t/p/w780${movie.backdrop_path || movie.poster_path}')" onclick="window.location.href='movie.html?id=${movie.id}'">
            <div class="trending-overlay">
                <div class="card-title">${movie.title}</div>
            </div>
        </div>
    `).join('');
}

function renderRecommendedGrid(movies) {
    const grid = document.getElementById('recommendedGrid');
    grid.innerHTML = movies.map(movie => `
        <div class="poster-card" onclick="window.location.href='movie.html?id=${movie.id}'">
            <div class="poster-wrapper" style="background-image: url('https://image.tmdb.org/t/p/w342${movie.poster_path}')">
                <div class="hd-ribbon">HD</div>
            </div>
            <div class="card-details">
                <div class="card-meta-line">
                    <span>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</span>
                    <span>• Movie</span>
                </div>
                <div class="card-title">${movie.title}</div>
            </div>
        </div>
    `).join('');
}
