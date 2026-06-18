const PROXY_URL = '/functions/tmdb';

document.addEventListener('DOMContentLoaded', () => {
    initGlobalUI();
    if(document.getElementById('heroSection')) {
        loadIndexData();
    }
});

function initGlobalUI() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if(window.scrollY > 50) {
            navbar.classList.add('scrolled');
            backToTop.classList.add('show');
        } else {
            navbar.classList.remove('scrolled');
            backToTop.classList.remove('show');
        }
    });

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('open');
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

async function fetchTMDB(endpoint, params = {}) {
    const searchParams = new URLSearchParams({ endpoint, ...params });
    try {
        const res = await fetch(`${PROXY_URL}?${searchParams.toString()}`);
        return await res.json();
    } catch (err) {
        console.error("API error pipeline fail:", err);
        return null;
    }
}

async function loadIndexData() {
    createSkeletons('trendingTrack', 6);
    createSkeletons('popularGrid', 8);

    const trending = await fetchTMDB('trending/movie/day');
    if(trending && trending.results.length > 0) {
        setupHero(trending.results[0]);
        renderTrack(trending.results, 'trendingTrack');
    }

    const popular = await fetchTMDB('movie/popular');
    if(popular) renderGrid(popular.results, 'popularGrid');

    const topRated = await fetchTMDB('movie/top_rated');
    if(topRated) renderGrid(topRated.results, 'topRatedGrid');

    const upcoming = await fetchTMDB('movie/upcoming');
    if(upcoming) renderGrid(upcoming.results, 'upcomingGrid');

    renderRecentlyViewed();
}

function createSkeletons(targetId, count) {
    const el = document.getElementById(targetId);
    el.innerHTML = Array(count).fill(`<div class="movie-card skeleton" style="height:270px;"></div>`).join('');
}

function setupHero(movie) {
    const hero = document.getElementById('heroSection');
    hero.style.backgroundImage = `url('https://image.tmdb.org/t/p/original${movie.backdrop_path}')`;
    
    document.getElementById('heroContent').innerHTML = `
        <div class="hero-badges">
            <span class="badge trending"><i class="fas fa-fire"></i> #1 TRENDING TODAY</span>
            <span class="badge">HD</span>
            <span class="badge">4K Ultra</span>
        </div>
        <h1 class="hero-title">${movie.title}</h1>
        <div class="hero-meta">
            <span class="rating"><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</span>
            <span>${movie.release_date.split('-')[0]}</span>
        </div>
        <p class="hero-overview">${movie.overview}</p>
        <div class="btn-group">
            <button class="btn btn-primary" onclick="window.location.href='movie.html?id=${movie.id}'"><i class="fas fa-play"></i> Watch Now</button>
            <button class="btn btn-secondary" onclick="window.location.href='movie.html?id=${movie.id}'"><i class="fas fa-info-circle"></i> Details</button>
        </div>
    `;
}

function renderTrack(movies, targetId) {
    const container = document.getElementById(targetId);
    container.innerHTML = movies.map(movie => createCardHTML(movie)).join('');
}

function renderGrid(movies, targetId) {
    const container = document.getElementById(targetId);
    container.innerHTML = movies.map(movie => createCardHTML(movie)).join('');
}

function createCardHTML(movie) {
    if(!movie.poster_path) return '';
    return `
        <div class="movie-card" onclick="window.location.href='movie.html?id=${movie.id}'">
            <img src="https://image.tmdb.org/t/p/w342${movie.poster_path}" alt="${movie.title}" loading="lazy">
            <div class="card-overlay">
                <h3 class="card-title">${movie.title}</h3>
                <div class="card-meta">
                    <span class="rating"><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</span>
                    <span>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
}

function renderRecentlyViewed() {
    const recent = JSON.parse(localStorage.getItem('recent_movies') || '[]');
    if(recent.length === 0) return;
    document.getElementById('recentSection').style.display = 'flex';
    renderTrack(recent, 'recentTrack');
}
