// ==========================================================================
// 1. إعدادات وتكوين المعطيات (Configuration)
// ==========================================================================
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY'; // حط الـ API Key ديالك هنا
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

// جلب الـ ID والـ Type من رابط الصفحة (?id=123&type=movie)
const urlParams = new URLSearchParams(window.location.search);
const mediaId = urlParams.get('id');
const mediaType = urlParams.get('type') || 'movie'; 

// السيرفرات المتاحة مع دعم ميزة Fullscreen والترجمة
const SERVERS = {
    server1: {
        movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
        tv: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
    },
    server2: {
        movie: (id) => `https://embed.su/embed/movie/${id}`,
        tv: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`
    }
};

let currentServer = 'server1';
let currentSeason = 1;
let currentEpisode = 1;

// ==========================================================================
// 2. تشغيل الصفحة عند التحميل
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    if (!mediaId) {
        console.error('Media ID missing');
        return;
    }
    
    // جلب داتا الفيلم أو المسلسل
    fetchMediaDetails();
    
    // تفعيل أزرار السيرفرات
    setupServerButtons();
});

// ==========================================================================
// 3. جلب البيانات من TMDB وتوزيعها
// ==========================================================================
async function fetchMediaDetails() {
    try {
        const response = await fetch(`${BASE_URL}/${mediaType}/${mediaId}?api_key=${TMDB_API_KEY}&append_to_response=recommendations`);
        const data = await response.json();
        
        // تحديث النصوص في الـ HTML
        document.title = data.title || data.name;
        document.getElementById('movieTitle').innerText = data.title || data.name;
        document.getElementById('movieOverview').innerText = data.overview || 'لا يوجد وصف متاح حالياً.';
        
        const releaseYear = (data.release_date || data.first_air_date || '').split('-')[0] || 'N/A';
        document.getElementById('movieYear').innerText = releaseYear;
        document.getElementById('movieRating').innerText = data.vote_average ? data.vote_average.toFixed(1) : '0.0';
        
        const genres = data.genres.map(g => g.name).join(', ');
        document.getElementById('movieGenres').innerText = genres;
        
        // تشغيل المشغل أول مرة
        loadPlayer();
        
        // التحكم في إظهار وإخفاء سيكشن الحلقات والمواسم
        if (mediaType === 'tv') {
            renderTVSelector(data);
        } else {
            const selectorContainer = document.getElementById('tvSelectorContainer');
            if (selectorContainer) selectorContainer.style.display = 'none';
        }
        
        // عرض المقترحات التحتية
        renderRecommendations(data.recommendations?.results || []);
        
    } catch (error) {
        console.error('Error fetching from TMDB:', error);
    }
}

// ==========================================================================
// 4. دالة المشغل الذهبية (تفعيل التكبير والترجمة ومنع التقطيع)
// ==========================================================================
function loadPlayer() {
    const wrapper = document.querySelector('.video-player-wrapper');
    if (!wrapper) return;
    
    let embedUrl = '';
    
    if (mediaType === 'movie') {
        // إذا كان فيلم عادي: إزالة كلاس التلفزة لحفظ الأبعاد السينمائية الأصلية
        wrapper.classList.remove('tv-mode');
        embedUrl = SERVERS[currentServer].movie(mediaId);
    } else {
        // إذا كان مسلسل: إضافة كلاس tv-mode لحل مشكلة التقطيع في الجوانب
        wrapper.classList.add('tv-mode');
        embedUrl = SERVERS[currentServer].tv(mediaId, currentSeason, currentEpisode);
    }
    
    // حقن الـ iframe مع تفعيل كاع الـ Flags د Fullscreen والسماح بالترجمة ف التيليفون
    wrapper.innerHTML = `
        <iframe 
            src="${embedUrl}" 
            allowfullscreen="true" 
            webkitallowfullscreen="true" 
            mozallowfullscreen="true" 
            oallowfullscreen="true" 
            msallowfullscreen="true"
            scrolling="no"
            frameborder="0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation">
        </iframe>
    `;
}

// ==========================================================================
// 5. إدارة المواسم والحلقات (للمسلسلات)
// ==========================================================================
function renderTVSelector(data) {
    const seasonSelect = document.getElementById('seasonSelect');
    const episodesGrid = document.getElementById('episodesGrid');
    
    if (!seasonSelect || !episodesGrid) return;
    
    seasonSelect.innerHTML = '';
    const seasons = data.seasons.filter(s => s.season_number > 0);
    
    if (seasons.length === 0 && data.seasons.length > 0) {
        seasons.push(data.seasons[0]);
    }
    
    seasons.forEach(season => {
        const option = document.createElement('option');
        option.value = season.season_number;
        option.innerText = `Season ${season.season_number}`;
        seasonSelect.appendChild(option);
    });
    
    seasonSelect.addEventListener('change', (e) => {
        currentSeason = parseInt(e.target.value);
        currentEpisode = 1; 
        fetchEpisodes(currentSeason);
    });
    
    if (seasons.length > 0) {
        currentSeason = seasons[0].season_number;
        fetchEpisodes(currentSeason);
    }
}

async function fetchEpisodes(seasonNumber) {
    const episodesGrid = document.getElementById('episodesGrid');
    if (!episodesGrid) return;
    
    episodesGrid.innerHTML = '<div style="color:var(--text-gray); font-size:13px;">جاري تحميل الحلقات...</div>';
    
    try {
        const response = await fetch(`${BASE_URL}/tv/${mediaId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        
        episodesGrid.innerHTML = '';
        
        data.episodes.forEach(ep => {
            const btn = document.createElement('button');
            btn.className = 'ep-btn';
            btn.innerText = `Ep ${ep.episode_number}`;
            
            // ستايل الحلقة الشغالة حالياً
            if (ep.episode_number === currentEpisode) {
                btn.style.borderColor = 'var(--primary-cyan)';
                btn.style.color = 'var(--primary-cyan)';
                btn.style.backgroundColor = 'rgba(0, 180, 216, 0.1)';
            }
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ep-btn').forEach(b => {
                    b.style.borderColor = '';
                    b.style.color = '';
                    b.style.backgroundColor = '';
                });
                
                btn.style.borderColor = 'var(--primary-cyan)';
                btn.style.color = 'var(--primary-cyan)';
                btn.style.backgroundColor = 'rgba(0, 180, 216, 0.1)';
                
                currentEpisode = ep.episode_number;
                loadPlayer(); // تحديث الفيديو
            });
            
            episodesGrid.appendChild(btn);
        });
    } catch (error) {
        episodesGrid.innerHTML = '<div style="color:#ef4444; font-size:13px;">خطأ في تحميل الحلقات.</div>';
    }
}

// ==========================================================================
// 6. التبديل بين السيرفرات
// ==========================================================================
function setupServerButtons() {
    const s1Btn = document.getElementById('server1Btn');
    const s2Btn = document.getElementById('server2Btn');
    
    if (s1Btn && s2Btn) {
        s1Btn.addEventListener('click', () => switchServer('server1', s1Btn, s2Btn));
        s2Btn.addEventListener('click', () => switchServer('server2', s2Btn, s1Btn));
    }
}

function switchServer(serverId, activeBtn, inactiveBtn) {
    if (currentServer === serverId) return;
    
    currentServer = serverId;
    
    activeBtn.style.borderColor = 'var(--primary-cyan)';
    activeBtn.style.color = 'var(--primary-cyan)';
    
    inactiveBtn.style.borderColor = '#64748b';
    inactiveBtn.style.color = '#cbd5e1';
    
    loadPlayer();
}

// ==========================================================================
// 7. عرض المقترحات (Recommendations)
// ==========================================================================
function renderRecommendations(items) {
    const recContainer = document.getElementById('recommendationsContainer');
    if (!recContainer) return;
    
    recContainer.innerHTML = '';
    const limitedItems = items.slice(0, 5);
    
    if (limitedItems.length === 0) {
        recContainer.innerHTML = '<div style="color:var(--text-gray); font-size:13px;">لا توجد مقترحات متوفرة.</div>';
        return;
    }
    
    limitedItems.forEach(item => {
        const row = document.createElement('div');
        row.className = 'rec-item-row';
        
        const posterPath = item.poster_path ? `${IMAGE_URL}${item.poster_path}` : 'https://via.placeholder.com/60x85?text=No+Image';
        const title = item.title || item.name;
        const year = (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A';
        const rating = item.vote_average ? item.vote_average.toFixed(1) : '0.0';
        const type = item.media_type || mediaType;
        
        row.innerHTML = `
            <div class="rec-thumb" style="background-image: url('${posterPath}')"></div>
            <div class="rec-text-side">
                <div class="rec-meta-line">
                    <span><i class="fas fa-star" style="color:#ffb703;"></i> ${rating}</span> &nbsp;•&nbsp; 
                    <span>${year}</span>
                </div>
                <div class="rec-movie-title">${title}</div>
            </div>
        `;
        
        row.addEventListener('click', () => {
            window.location.href = `movie-page.html?id=${item.id}&type=${type}`;
        });
        
        recContainer.appendChild(row);
    });
}
