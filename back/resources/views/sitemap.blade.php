<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

    <!-- Homepage -->
    <url>
        <loc>{{ $frontendUrl }}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
        <lastmod>{{ now()->toAtomString() }}</lastmod>
    </url>

    <!-- Authentication -->
    <url>
        <loc>{{ $frontendUrl }}/auth</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>

    <!-- Main App -->
    <url>
        <loc>{{ $frontendUrl }}/main</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>

    <!-- Albums -->
    @foreach($albums as $album)
    <url>
        <loc>{{ $frontendUrl }}/album/{{ $album->id }}</loc>
        <lastmod>{{ $album->updated_at->toAtomString() }}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    @endforeach

    <!-- Playlists -->
    @foreach($playlists as $playlist)
    <url>
        <loc>{{ $frontendUrl }}/playlist/{{ $playlist->id }}</loc>
        <lastmod>{{ $playlist->updated_at->toAtomString() }}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
    @endforeach

    <!-- Artists / Users -->
    @foreach($artists as $artist)
    <url>
        <loc>{{ $frontendUrl }}/profile?user={{ $artist->id }}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
    </url>
    @endforeach

    <!-- Legal Pages -->
    <url>
        <loc>{{ $frontendUrl }}/privacy</loc>
        <changefreq>monthly</changefreq>
        <priority>0.3</priority>
    </url>

    <url>
        <loc>{{ $frontendUrl }}/terms</loc>
        <changefreq>monthly</changefreq>
        <priority>0.3</priority>
    </url>

</urlset>
