// الرابط الصحيح والمضمون للـ Proxy فـ Cloudflare Pages
const API_PROXY = '/tmdb';

document.addEventListener('DOMContentLoaded', () => {
    // تشغيل الصفحة الرئيسية إذا كان العنصر موجوداً
    if (document.getElementById('mainHero')) {
        initHomePage();
    }
});

// دالة الاتصال بالـ Proxy بجلب البيانات كاملة
async function callProxy(endpoint, additionalParams = {}) {
    const queryParams = new URLSearchParams({ endpoint, ...additionalParams });
    try {
        const response = await fetch(`${API_PROXY}?${queryParams.toString()}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        console.error("Proxy integration failed:", err);
        return null;
    }
}

// تشغيل جلب البيانات والـ Skeletons
async function initHomePage() {
    const trendingContainer = document.getElementById('trendingContainer');
    const recommendedGrid = document.getElementById('recommendedGrid');

    // 1. عرض مربعات التحميل (Skeletons) المريقلة بحال FMovies
    if (trendingContainer) {
        trendingContainer.innerHTML = Array(5).fill('<div class="trending-card skeleton-box" style="min-width:260px; height:150px; background:#111;"></div>').join('');
    }
    if (recommendedGrid) {
        recommendedGrid.innerHTML = Array(8).fill(`
            <div class="poster-card">
                <div class="poster-wrapper skeleton-box" style="padding-top:150%; background:#111;"></div>
                <div style="padding:10px 0;"><div class="skeleton-box" style="height:15px; width:70%; margin-bottom:5px;"></div><div class="skeleton-box" style="height:12px; width:40%;"></div></div>
            </div>
        `).join('');
    }

    // 2. جلب أفلام الـ Trending (البارز الفوق والشريط الأفقي)
    const trendingData = await callProxy('trending/movie/day');
    if (trendingData && trendingData.results && trendingData.results.length > 0) {
        setupHero(trendingData.results[0]);
        renderTrendingTrack(trendingData.results.slice(1, 11)); // أول فيلم فالهيرو، والخرين فالشريط
    }

    // 3. جلب الأفلام المقترحة (Recommended)
    const popularData = await callProxy('movie/popular');
    if (popularData && popularData.results) {
        renderRecommendedGrid(popularData.results);
    }
}

// إعداد الهيرو السينمائي الكبير (Hero Banner)
function setupHero(movie) {
    const hero = document.getElementById('mainHero');
    const details = document.getElementById('heroDetails');
    if (!hero || !details) return;

    hero.style.backgroundImage = `url('https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}')`;
    
    // جلب السنة فقط من تاريخ الإصدار
    const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : '2026';

    details.innerHTML = `
        <h1 class="hero-title">${movie.title}</h1>
        <div class="hero-meta-row">
            <span class="badge-cyan">4K</span>
            <span class="badge-outline">TV-MA</span>
            <span><i class="fa-solid fa-star rating-star"></i> ${movie.vote_average ? movie.vote_average.toFixed(1) : '8.5'}</span>
            <span>${releaseYear}</span>
            <span>1h 45min</span>
        </div>
        <button class="btn-watch" onclick="window.location.href='movie.html?id=${movie.id}'">
            <i class="fa-solid fa-circle-play"></i> Watch Now
        </button>
    `;
}

// رندرة شريط الأفلام الرائجة أفقياً (Trending Track)
function renderTrendingTrack(movies) {
    const container = document.getElementById('trendingContainer');
    if (!container) return;

    container.innerHTML = movies.map(movie => `
        <div class="trending-card" style="background-image: url('https://image.tmdb.org/t/p/w780${movie.backdrop_path || movie.poster_path}')" onclick="window.location.href='movie.html?id=${movie.id}'">
            <div class="trending-overlay">
                <div class="card-title" style="font-weight:600; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);">${movie.title}</div>
            </div>
        </div>
    `).join('');
}

// رندرة شبكة الأفلام المقترحة (Recommended Grid)
function renderRecommendedGrid(movies) {
    const grid = document.getElementById('recommendedGrid');
    if (!grid) return;

    grid.innerHTML = movies.map(movie => {
        const year = movie.release_date ? movie.release_date.split('-')[0] : '2026';
        return `
            <div class="poster-card" onclick="window.location.href='movie.html?id=${movie.id}'">
                <div class="poster-wrapper" style="background-image: url('https://image.tmdb.org/t/p/w342${movie.poster_path}')">
                    <div class="hd-ribbon">HD</div>
                </div>
                <div class="card-details">
                    <div class="card-meta-line">
                        <span>${year}</span>
                        <span>• Movie</span>
                    </div>
                    <div class="card-title">${movie.title}</div>
                </div>
            </div>
        `;
    }).join('');
}
