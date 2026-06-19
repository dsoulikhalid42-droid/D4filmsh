const API_PROXY = '/tmdb';
let currentId = '';
let currentType = 'movie';
let currentSeason = 1;
let currentEpisode = 1;
let currentServer = 1;
let isPlayerLoaded = false;

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
    const data = await fetch(`${API_PROXY}?endpoint=${currentType}/${currentId}`).then(res => res.json());
    if (!data) return;

    // إظهار بوستر الفيلم كخلفية للمشغل قبل الضغط (مريح جداً للعين)
    const wrapper = document.querySelector('.video-player-wrapper');
    if (wrapper) {
        const bgImg = data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : '';
        wrapper.innerHTML = `
            <div id="playPlaceholderBtn" onclick="activatePlayer()" style="position:absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('${bgImg}') center/cover; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10;">
                <div style="width:75px; height:75px; background:var(--primary-cyan); border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 25px rgba(0, 180, 216, 0.7); font-size:26px; color:#000; padding-left:5px;"><i class="fa-solid fa-play"></i></div>
            </div>
        `;
    }

    // ربط زر Watch Now الأساسي التحتاني باش يشغل الفيديو فوراً
    const watchNowBtn = document.querySelector('.player-buttons button');
    if (watchNowBtn) {
        watchNowBtn.setAttribute('onclick', 'activatePlayer()');
    }

    // تفاصيل النصية
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

    // إدارة حلقات المسلسلات بنقاء كامل
    if (currentType === 'tv') {
        const tvContainer = document.getElementById('tvSelectorContainer');
        tvContainer.style.display = 'block';
        
        const seasonSelect = document.getElementById('seasonSelect');
        seasonSelect.innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `
            <option value="${s.season_number}">Season ${s.season_number}</option>
        `).join('');

        seasonSelect.addEventListener('change', (e) => {
            currentSeason = parseInt(e.target.value);
            currentEpisode = 1;
            const targetS = data.seasons.find(s => s.season_number === currentSeason);
            loadEpisodes(targetS ? targetS.episode_count : 1);
        });

        if(data.seasons.length > 0) {
            const firstSeason = data.seasons.find(s => s.season_number === 1) || data.seasons[0];
            loadEpisodes(firstSeason.episode_count);
        }
    }

    // جلب المقترحات المنوعة لصفحة العرض
    const recs = await fetch(`${API_PROXY}?endpoint=${currentType}/${currentId}/recommendations`).then(res => res.json());
    if (recs && recs.results) {
        renderRecommendedList(recs.results.slice(0, 8));
    }
}

function loadEpisodes(count) {
    const grid = document.getElementById('episodesGrid');
    grid.innerHTML = Array.from({length: count}, (_, i) => i + 1).map(ep => `
        <button class="ep-btn" onclick="playEpisode(${ep})" style="padding:10px; background:#0b0c10; color:#fff; border:1px solid rgba(255,255,255,0.08); border-radius:6px; cursor:pointer; font-size:13px; transition:all 0.2s;">Ep ${ep}</button>
    `).join('');
    updateActiveEpStyle();
}

function playEpisode(ep) {
    currentEpisode = ep;
    updateActiveEpStyle();
    if(isPlayerLoaded) {
        updatePlayer();
    } else {
        activatePlayer();
    }
}

function updateActiveEpStyle() {
    const buttons = document.querySelectorAll('#episodesGrid button');
    buttons.forEach((btn, index) => {
        if(index + 1 === currentEpisode) {
            btn.style.background = 'var(--primary-cyan)';
            btn.style.color = '#000';
            btn.style.borderColor = 'var(--primary-cyan)';
        } else {
            btn.style.background = '#0b0c10';
            btn.style.color = '#fff';
            btn.style.borderColor = 'rgba(255,255,255,0.08)';
        }
    });
}

function activatePlayer() {
    isPlayerLoaded = true;
    updatePlayer();
}

function updatePlayer() {
    if(!isPlayerLoaded) return;
    const wrapper = document.querySelector('.video-player-wrapper');
    let embedUrl = '';

    // استخدام أفضل وأسرع سيرفرات vidsrc و vidfast حالياً
    if (currentType === 'movie') {
        embedUrl = currentServer === 1 
            ? `https://vidsrc.pro/embed/movie/${currentId}` 
            : `https://vidsrc.to/embed/movie/${currentId}`;
    } else {
        embedUrl = currentServer === 1 
            ? `https://vidsrc.pro/embed/tv/${currentId}/${currentSeason}/${currentEpisode}` 
            : `https://vidsrc.to/embed/tv/${currentId}/${currentSeason}/${currentEpisode}`;
    }

    wrapper.innerHTML = `<iframe src="${embedUrl}" allowfullscreen style="width:100%; height:100%; border:none;"></iframe>`;
    
    document.getElementById('srv1').style.color = currentServer === 1 ? 'var(--primary-cyan)' : '#cbd5e1';
    document.getElementById('srv1').style.borderColor = currentServer === 1 ? 'var(--primary-cyan)' : '#64748b';
    document.getElementById('srv2').style.color = currentServer === 2 ? 'var(--primary-cyan)' : '#cbd5e1';
    document.getElementById('srv2').style.borderColor = currentServer === 2 ? 'var(--primary-cyan)' : '#64748b';
}

function switchServerLink(num) {
    currentServer = num;
    if(isPlayerLoaded) updatePlayer();
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
