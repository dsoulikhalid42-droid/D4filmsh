export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const endpoint = url.searchParams.get("endpoint");

  if (!endpoint) {
    return new Response(JSON.stringify({ error: "Missing endpoint" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const targetUrl = new URL(`https://api.themoviedb.org/3/${endpoint}`);
  targetUrl.searchParams.set("api_key", env.TMDB_API_KEY);
  
  for (const [key, value] of url.searchParams.entries()) {
    if (key !== "endpoint") {
      targetUrl.searchParams.set(key, value);
    }
  }

  try {
    const response = await fetch(targetUrl.toString());
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
  }
}
