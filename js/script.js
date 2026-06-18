const API_PROXY = '/tmdb';
let heroMovies = [];
let currentSlideIndex = 0;
let sliderInterval;

document.addEventListener('DOMContentLoaded', () => {
    initPlatform();
});

async function callProxy(endpoint, additionalParams = {}) {
    const queryParams = new URLSearchParams({ endpoint, ...additionalParams });
    try {
        const response = await fetch(`${API_PROXY}?${queryParams.toString()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error("Proxy failure:", err);
        return null;
    }
}

async function initPlatform() {
    // 1. صناعة شبكات الهياكل (Skeletons) بصفة مؤقتة
    generateSkeletons();

    // 2. جلب البيانات من الـ API
    const trendingData = await callProxy('trending/movie/day');
    const topRatedData = await callProxy('movie/top_rated');
    const popularData = await callProxy('movie/popular');
    const actionData = await callProxy('discover/movie', { with_genres: '28' });

    // 3. رندرة الـ Hero السلايدر
    if (trendingData && trendingData.results && trendingData.results.length > 0) {
        heroMovies = trendingData.results.slice(0, 5);
        setupHeroSlider();
        renderGrid('trendingGrid', trendingData.results);
    }

    // 4. رندرة باقي الأقسام
    if (topRatedData && topRatedData.results) renderGrid('topRatedGrid', topRatedData.results);
    if (popularData && popularData.results) renderGrid('popularGrid', popularData.results);
    if (actionData && actionData.results) renderGrid('actionGrid', actionData.results);
}

function setupHeroSlider() {
    const sliderContainer = document.getElementById('heroSliderContainer');
    if (!sliderContainer) return;

    sliderContainer.innerHTML = heroMovies.map((movie, index) => {
        const year = movie.release_date ? movie.release_date.split('-')[0] : '2026';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '8.5';
        const backdrop = `https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`;
        
        return `
            <div class="hero-slide ${index === 0 ? 'active' : ''}" style="background-image: url('${backdrop}')">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <h1 class="hero-title">${movie.title}</h1>
                    <div class="hero-meta">
                        <span class="badge-cyan">4K</span>
                        <span class="badge-outline">TV-MA</span>
                        <span><i class="fa-solid fa-star rating-star"></i> ${rating}</span>
                        <span>${year}</span>
                        <span>Movie</span>
                    </div>
                    <button class="btn-watch" onclick="window.location.href='movie.html?id=${movie.id}'">
                        <i class="fa-solid fa-circle-play"></i> Watch Now
                    </button>
                </div>
            </div>
        `;
    }).join('');

    if (sliderInterval) clearInterval(sliderInterval);
    sliderInterval = setInterval(nextSlide, 4000);
}

function nextSlide() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;

    slides[currentSlideIndex].classList.remove('active');
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    slides[currentSlideIndex].classList.add('active');
}

function renderGrid(containerId, movies) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    grid.innerHTML = movies.map(movie => {
        const year = movie.release_date ? movie.release_date.split('-')[0] : '2026';
        const poster = `https://image.tmdb.org/t/p/w342${movie.poster_path}`;
        
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

function generateSkeletons() {
    const grids = ['trendingGrid', 'topRatedGrid', 'popularGrid', 'actionGrid'];
    grids.forEach(id => {
        const grid = document.getElementById(id);
        if (grid) {
            grid.innerHTML = Array(12).fill(`
                <div class="movie-card">
                    <div class="poster-box skeleton"></div>
                    <div class="card-info">
                        <div class="skeleton" style="height:12px; width:40%; margin-bottom:6px; border-radius:3px;"></div>
                        <div class="skeleton" style="height:14px; width:80%; border-radius:3px;"></div>
                    </div>
                </div>
            `).join('');
        }
    });
}
