<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My List - D4FILMS</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>

    <header id="navbar" class="scrolled">
        <a href="index.html" class="logo">D4<span>FILMS</span></a>
        <nav class="nav-links">
            <a href="index.html">Home</a>
            <a href="search.html">Catalog</a>
            <a href="watchlist.html" class="active">Watchlist</a>
        </nav>
    </header>

    <main style="padding-top: 120px;">
        <h2 class="section-title"><i class="fas fa-bookmark" style="color: var(--primary);"></i> My Watchlist</h2>
        <div class="movie-grid" id="watchlistGrid"></div>
    </main>

    <script src="js/script.js"></script>
    <script src="js/watchlist.js"></script>
</body>
</html>
