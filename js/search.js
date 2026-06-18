document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    let timeout = null;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        const query = e.target.value.trim();
        
        if(query.length < 2) {
            document.getElementById('searchResults').innerHTML = '';
            return;
        }

        timeout = setTimeout(() => {
            executeSearch(query);
        }, 400);
    });
});

async function executeSearch(query) {
    document.getElementById('searchTitle').innerText = `Results for: "${query}"`;
    const data = await fetchTMDB('search/movie', { query: query });
    if(data && data.results) {
        const container = document.getElementById('searchResults');
        if(data.results.length === 0) {
            container.innerHTML = `<p style="padding: 2rem 4%; color: var(--muted);">No matches discovered for your parameters.</p>`;
            return;
        }
        container.innerHTML = data.results.map(movie => createCardHTML(movie)).join('');
    }
}
