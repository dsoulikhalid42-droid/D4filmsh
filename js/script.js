const API_PROXY = '/tmdb';
let heroSlidesData = [];
let currentSlideIndex = 0;
let slideInterval;

document.addEventListener('DOMContentLoaded', () => {
    initD4Home();
});

async function initD4Home() {
    try {
        // 1. جلب بيانات الـ Trend الشاملة (أفلام ومسلسلات مخلطة)
        const trendData = await fetch(`${API_PROXY}?endpoint=trending/all/week`).then(res => res.json());
        
        if (trendData && trendData.results && trendData.results.length > 0) {
            const allItems = trendData.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
            
            // خود أول 5 حبات ناضيين لـ الـ Hero Slider
            heroSlidesData = allItems.slice(0, 5);
            renderHeroSlider();
            startHeroAutoplay();

            // خود 20 حبة لـ سيكشن Trending Now (السلايدر الأفقي)
            renderTrendingSlider(allItems.slice(0, 20));
        }

        // 2. جلب بيانات مستقلة وقوية لـ سيكشن Recommended (أفلام ومسلسلات رائجة ومستفة)
        const topMovies = await fetch(`${API_PROXY}?endpoint=movie/popular`).then(res => res.json());
        const topTV = await fetch(`${API_PROXY}?endpoint=tv/popular`).then(res => res.json());
        
        let recList = [];
        if (topMovies && topMovies.results) recList = recList.concat(topMovies.results.map(m => ({...m, media_type: 'movie'})));
        if (topTV && topTV.results) recList = recList.concat(topTV.results.map(t => ({...t, media_type: 'tv'})));
        
        // خلط البيانات باش تطلع منوعة ومريحة للعين (كمية مهمة: 18 حبة)
        recList = recList.sort(() => 0.5 - Math.random()).slice(0, 18);
        renderRecommendedGrid(recList);

    } catch (error) {
        console.error("Error loading home data:", error);
    }
}

// رندرة الـ Hero Slider ديناميكياً
function renderHeroSlider() {
    const container = document.getElementById('heroSlider');
    if (!container) return;

    container.innerHTML = heroSlidesData.map((item, index) => {
        const title = item.title || item.name;
        const type = item.media_type;
        const year = type === 'movie' ? (item.release_date ? item.release_date.split('-')[0] : '2026') : (item.first_air_date ? item.first_air_date.split('-')[0] : '2026');
        const backdrop = `https://image.tmdb.org/t/p/original${item.backdrop_path}`;
        const rating = item.vote_average ? item.vote_average.toFixed(1) : '7.8';
        
        return `
            <div class="hero-slide ${index === 0 ? 'active' : ''}" style="background-image: url('${backdrop}');">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <h1 class="hero-title">${title}</h1>
                    <div class="hero-meta">
                        <span class="badge-cyan">HD</span>
                        <span><i class="fa-solid fa-star rating-star"></i> ${rating}</span>
                        <span>${year}</span>
                        <span style="text-transform: uppercase;">${type === 'movie' ? 'Movie' : 'TV Show'}</span>
                    </div>
                    <button class="btn-watch" onclick="window.location.href='movie.html?id=${item.id}&type=${type}'">
                        <i class="fa-solid fa-play"></i> Watch Now
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// دالة التبديل التلقائي كل 4 ثواني
function startHeroAutoplay() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        const slides = document.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;
        
        slides[currentSlideIndex].classList.remove('active');
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        slides[currentSlideIndex].classList.add('active');
    }, 4000); // 4000ms = 4 ثواني
}

// رندرة سلايدر Trending Now (20 حبة أفقية)
function renderTrendingSlider(items) {
    const slider = document.getElementById('trendingNowSlider');
    if (!slider) return;

    slider.innerHTML = items.map(item => {
        const title = item.title || item.name;
        const type = item.media_type;
        const year = type === 'movie' ? (item.release_date ? item.release_date.split('-')[0] : '2026') : (item.first_air_date ? item.first_air_date.split('-')[0] : '2026');
        const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : 'https://via.placeholder.com/342x500?text=No+Poster';
        
        return `
            <div class="movie-card" onclick="window.location.href='movie.html?id=${item.id}&type=${type}'">
                <div class="poster-box" style="background-image: url('${poster}')">
                    <div class="hd-tag">HD</div>
                </div>
                <div class="card-info">
                    <div class="card-meta"><span>${year}</span><span>• ${type === 'movie' ? 'Movie' : 'TV'}</span></div>
                    <div class="card-title">${title}</div>
                </div>
            </div>
        `;
    }).join('');
}

// رندرة شبكة المقترحات لتحت (Grid ثابت ونقي)
function renderRecommendedGrid(items) {
    const grid = document.getElementById('recommendedGrid');
    if (!grid) return;

    grid.innerHTML = items.map(item => {
        const title = item.title || item.name;
        const type = item.media_type;
        const year = type === 'movie' ? (item.release_date ? item.release_date.split('-')[0] : '2026') : (item.first_air_date ? item.first_air_date.split('-')[0] : '2026');
        const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : 'https://via.placeholder.com/342x500?text=No+Poster';
        
        return `
            <div class="movie-card" onclick="window.location.href='movie.html?id=${item.id}&type=${type}'">
                <div class="poster-box" style="background-image: url('${poster}')">
                    <div class="hd-tag">HD</div>
                </div>
                <div class="card-info">
                    <div class="card-meta"><span>${year}</span><span>• ${type === 'movie' ? 'Movie' : 'TV'}</span></div>
                    <div class="card-title">${title}</div>
                </div>
            </div>
        `;
    }).join('');
}
