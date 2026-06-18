document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        fetchMovieDetails(id);
    }
});

async function fetchMovieDetails(id) {
    const movie = await callProxy(`movie/${id}`);
    if (!movie) return;

    document.getElementById('mainPosterImg').src = `https://image.tmdb.org/t/p/w780${movie.poster_path}`;
    document.getElementById('detailTitle').innerText = movie.title;
    
    document.getElementById('detailMeta').innerHTML = `
        <span class="badge-cyan">4K</span>
        <span class="badge-outline">M18</span>
        <span><i class="fa-solid fa-star rating-star"></i> ${movie.vote_average.toFixed(1)}</span>
        <span>${movie.release_date}</span>
        <span>${movie.runtime}m</span>
    `;
    
    document.getElementById('detailOverview').innerText = movie.overview;
    
    document.getElementById('specsBlock').innerHTML = `
        <div class="meta-spec-item"><span>Type:</span> Movie</div>
        <div class="meta-spec-item"><span>Genre:</span> ${movie.genres.map(g => g.name).join(', ')}</div>
    `;

    const triggerStreaming = () => {
        const container = document.getElementById('streamContainer');
        const frame = document.getElementById('embedFrame');
        document.getElementById('posterArea').style.display = 'none';
        container.classList.add('active');
        
        // Primary route setup
        frame.src = `https://vidfast.pro/movie/${id}`;
        
        // Safety Fallback routing logic
        setTimeout(() => {
            try {
                if(!frame.contentWindow || frame.contentWindow.length === 0) {
                    frame.src = `https://vidsrc.xyz/embed/movie/${id}`;
                }
            } catch(e) {
                // cross-origin catch
            }
        }, 3500);
        
        container.scrollIntoView({ behavior: 'smooth' });
    };

    document.getElementById('centerPlay').addEventListener('click', triggerStreaming);
    document.getElementById('watchAction').addEventListener('click', triggerStreaming);
    
    document.getElementById('downloadAction').addEventListener('click', () => {
        window.open(`https://vidsrc.xyz/embed/movie/${id}`, '_blank');
    });

    // Recommendations rendering
    const recData = await callProxy(`movie/${id}/similar`);
    if (recData && recData.results.length > 0) {
        const grid = document.getElementById('detailRecommended');
        grid.innerHTML = recData.results.slice(0, 6).map(m => `
            <div class="poster-card" onclick="window.location.href='movie.html?id=${m.id}'">
                <div class="poster-wrapper" style="background-image: url('https://image.tmdb.org/t/p/w342${m.poster_path}')">
                    <div class="hd-ribbon">HD</div>
                </div>
                <div class="card-details">
                    <div class="card-meta-line">
                        <span>${m.release_date ? m.release_date.split('-')[0] : '2026'}</span>
                        <span>• Movie</span>
                    </div>
                    <div class="card-title">${m.title}</div>
                </div>
            </div>
        `).join('');
    }
}
