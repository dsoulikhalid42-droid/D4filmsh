export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const endpoint = url.searchParams.get("endpoint");

  if (!endpoint) {
    return new Response(JSON.stringify({ error: "No endpoint" }), { status: 400 });
  }

  // بناء الرابط نيشان مع الساروت المأخوذ من Cloudflare Settings
  const tmdbUrl = `https://api.themoviedb.org/3/${endpoint}?api_key=${env.TMDB_API_KEY}`;
  
  // زيادة أي پارامترات أخرى بحال الـ query ديال البحث
  const finalUrl = new URL(tmdbUrl);
  for (const [key, value] of url.searchParams.entries()) {
    if (key !== "endpoint") {
      finalUrl.searchParams.set(key, value);
    }
  }

  try {
    const res = await fetch(finalUrl.toString());
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
