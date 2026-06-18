document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('id');
    if (movieId) {
        loadMovieDetails(movieId);
        trackRecent(movieId);
    }
});

async function loadMovieDetails(id) {
    const movie = await fetchTMDB(`movie/${id}`);
    if (!movie) return;

    document.getElementById('detailsHero').style.backgroundImage = `url('https://image.tmdb.org/t/p/original${movie.backdrop_path}')`;
    document.getElementById('moviePoster').src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    document.getElementById('movieTitle').innerText = movie.title;
    
    const genres = movie.genres.map(g => g.name).join(', ');
    document.getElementById('movieMeta').innerHTML = `
        <span class="rating"><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</span>
        <span>${movie.release_date.split('-')[0]}</span>
        <span>${movie.runtime} mins</span>
        <span>${genres}</span>
    `;
    
    document.getElementById('movieOverview').innerText = movie.overview;

    // Stream Setup 
    const watchBtn = document.getElementById('watchBtn');
    const playerSection = document.getElementById('playerSection');
    const player = document.getElementById('videoPlayer');

    watchBtn.addEventListener('click', () => {
        playerSection.classList.add('active');
        player.src = `https://vidfast.pro/movie/${id}`;
        
        // Auto fallback test wrapper setup
        setTimeout(() => {
            try {
                if(!player.contentWindow || player.contentWindow.length === 0) {
                     player.src = `https://vidsrc.xyz/embed/movie/${id}`;
                }
            } catch(e) {
                // Cross origin safeguard fallback triggers if connection fails
            }
        }, 3500);

        playerSection.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('downloadBtn').addEventListener('click', () => {
        window.open(`https://vidsrc.xyz/embed/movie/${id}`, '_blank');
    });

    setupWatchlistBtn(movie);
    loadRecommendations(id);
}

function setupWatchlistBtn(movie) {
    const btn = document.getElementById('watchlistBtn');
    let list = JSON.parse(localStorage.getItem('d4_watchlist') || '[]');
    let exists = list.some(m => m.id === movie.id);

    const updateState = () => {
        if(exists) {
            btn.innerHTML = `<i class="fas fa-check"></i> In Watchlist`;
            btn.classList.add('btn-primary');
        } else {
            btn.innerHTML = `<i class="fas fa-plus"></i> Add to List`;
            btn.classList.remove('btn-primary');
        }
    };

    updateState();

    btn.addEventListener('click', () => {
        list = JSON.parse(localStorage.getItem('d4_watchlist') || '[]');
        if(exists) {
            list = list.filter(m => m.id !== movie.id);
            exists = false;
        } else {
            list.push({ id: movie.id, title: movie.title, poster_path: movie.poster_path, vote_average: movie.vote_average });
            exists = true;
        }
        localStorage.setItem('d4_watchlist', JSON.stringify(list));
        updateState();
    });
}

async function trackRecent(id) {
    const movie = await fetchTMDB(`movie/${id}`);
    if(!movie) return;
    let recent = JSON.parse(localStorage.getItem('recent_movies') || '[]');
    recent = recent.filter(m => m.id !== movie.id);
    recent.unshift({ id: movie.id, title: movie.title, poster_path: movie.poster_path, vote_average: movie.vote_average });
    if(recent.length > 10) recent.pop();
    localStorage.setItem('recent_movies', JSON.stringify(recent));
}

async function loadRecommendations(id) {
    const data = await fetchTMDB(`movie/${id}/recommendations`);
    if(data && data.results.length > 0) {
        renderGrid(data.results.slice(0, 12), 'similarGrid');
    }
}
