const API_PROXY = '/tmdb';
let currentId = '';
let currentType = 'movie'; // الافتراضي فيلم
let currentSeason = 1;
let currentEpisode = 1;
let currentServer = 1;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentId = urlParams.get('id');
    currentType = urlParams.get('type') || 'movie';
    
    if (currentId) {
        loadContentDetails();
    } else {
        window.location.href = 'index.html';
    }
});

async function loadContentDetails() {
    // جلب البيانات على حسب النوع (movie أو tv)
    const data = await fetch(`${API_PROXY}?endpoint=${currentType}/${currentId}`).then(res => res.json());
    if (!data) return;

    // تشغيل السيرفر تلقائياً
    updatePlayer();

    // تعبئة التفاصيل
    const detailsContainer = document.getElementById('movieDetailsContainer');
    const year = currentType === 'movie' ? (data.release_date ? data.release_date.split('-')[0] : '2026') : (data.first_air_date ? data.first_air_date.split('-')[0] : '2026');
    const title = data.title || data.name;
    const genres = data.genres ? data.genres.map(g => g.name).join(', ') : 'N/A';

    detailsContainer.innerHTML = `
        <h1 class="movie-main-title">${title}</h1>
        <div class="hero-meta" style="margin-bottom:10px;">
            <span class="badge-cyan">HD</span>
            <span><i class="fa-solid fa-star rating-star"></i> ${data.vote_average ? data.vote_average.toFixed(1) : '7.5'}</span>
            <span>${year}</span>
            <span>${currentType === 'movie' ? 'Movie' : 'TV Show'}</span>
        </div>
        <p class="movie-story">${data.overview || 'No overview available.'}</p>
        <div class="movie-sub-meta"><strong>Genre:</strong> ${genres}</div>
    `;

    // التعامل مع مواسم وحلقات المسلسلات
    if (currentType === 'tv') {
        const tvContainer = document.getElementById('tvSelectorContainer');
        tvContainer.style.display = 'block';
        
        const seasonSelect = document.getElementById('seasonSelect');
        seasonSelect.innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `
            <option value="${s.season_number}">Season ${s.season_number} (${s.episode_count} Ep)</option>
        `).join('');

        // عند تغيير الموسم، جلب الحلقات الخاصة بيه
        seasonSelect.addEventListener('change', (e) => {
            currentSeason = parseInt(e.target.value);
            currentEpisode = 1;
            loadEpisodes(data.seasons.find(s => s.season_number === currentSeason).episode_count);
        });

        // تحميل حلقات الموسم الأول افتراضياً
        if(data.seasons.length > 0) {
            const firstSeason = data.seasons.find(s => s.season_number === 1) || data.seasons[0];
            loadEpisodes(firstSeason.episode_count);
        }
    }

    // جلب المقترحات
    const recs = await fetch(`${API_PROXY}?endpoint=${currentType}/${currentId}/recommendations`).then(res => res.json());
    if (recs && recs.results) {
        renderRecommendedList(recs.results.slice(0, 6));
    }
}

function loadEpisodes(count) {
    const grid = document.getElementById('episodesGrid');
    grid.innerHTML = Array.from({length: count}, (_, i) => i + 1).map(ep => `
        <button class="ep-btn ${ep === currentEpisode ? 'active' : ''}" onclick="playEpisode(${ep})" style="padding:6px; background:${ep === currentEpisode ? '#00b4d8':'#0b0c10'}; color:#fff; border:1px solid #374151; border-radius:4px; cursor:pointer;">${ep}</button>
    `).join('');
}

function playEpisode(ep) {
    currentEpisode = ep;
    // تحديث الأزرار النشطة
    const buttons = document.querySelectorAll('#episodesGrid button');
    buttons.forEach((btn, index) => {
        if(index + 1 === ep) {
            btn.style.background = '#00b4d8';
        } else {
            btn.style.background = '#0b0c10';
        }
    });
    updatePlayer();
}

function updatePlayer() {
    const wrapper = document.querySelector('.video-player-wrapper');
    let embedUrl = '';

    if (currentType === 'movie') {
        embedUrl = currentServer === 1 
            ? `https://vidsrc.cc/v2/embed/movie/${currentId}` 
            : `https://multiembed.mov/?video_id=${currentId}&tmdb=1`;
    } else {
        embedUrl = currentServer === 1 
            ? `https://vidsrc.cc/v2/embed/tv/${currentId}/${currentSeason}/${currentEpisode}` 
            : `https://multiembed.mov/?video_id=${currentId}&tmdb=1&s=${currentSeason}&e=${currentEpisode}`;
    }

    wrapper.innerHTML = `<iframe src="${embedUrl}" allowfullscreen style="width:100%; height:100%; border:none;"></iframe>`;
    
    // ستايل السيرفر النشط
    document.getElementById('srv1').style.borderColor = currentServer === 1 ? '#00b4d8' : '#64748b';
    document.getElementById('srv2').style.borderColor = currentServer === 2 ? '#00b4d8' : '#64748b';
}

function switchServerLink(num) {
    currentServer = num;
    updatePlayer();
}

function renderRecommendedList(movies) {
    const container = document.getElementById('recommendedList');
    container.innerHTML = movies.map(m => {
        const title = m.title || m.name;
        const year = m.release_date ? m.release_date.split('-')[0] : (m.first_air_date ? m.first_air_date.split('-')[0] : '2026');
        const poster = m.poster_path ? `https://image.tmdb.org/t/p/w185${m.poster_path}` : 'https://via.placeholder.com/185x278?text=No+Poster';
        return `
            <div class="rec-item-row" onclick="window.location.href='movie.html?id=${m.id}&type=${currentType}'">
                <div class="rec-thumb" style="background-image: url('${poster}')"></div>
                <div class="rec-text-side">
                    <div class="rec-meta-line">${currentType === 'movie' ? 'Movie' : 'TV Show'} • ${year}</div>
                    <div class="rec-movie-title">${title}</div>
                </div>
            </div>
        `;
    }).join('');
}
