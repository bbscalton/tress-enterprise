interface Env {
  BUCKET: R2Bucket;
  ALLOWED_ORIGINS: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? '';
    const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
    const corsOrigin = allowed.includes(origin) ? origin : allowed[0];

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(corsOrigin),
      });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/^\//, '');

    if (request.method === 'GET' && path) {
      const object = await env.BUCKET.get(path);
      if (!object) {
        return new Response('Not found', { status: 404, headers: corsHeaders(corsOrigin) });
      }
      const headers = new Headers(corsHeaders(corsOrigin));
      headers.set('Content-Type', object.httpMetadata?.contentType ?? 'application/octet-stream');
      return new Response(object.body, { headers });
    }

    if (request.method === 'PUT' && path) {
      const contentType = request.headers.get('Content-Type') ?? 'application/octet-stream';
      await env.BUCKET.put(path, request.body, {
        httpMetadata: { contentType },
      });
      return new Response(JSON.stringify({ path, url: `${url.origin}/${path}` }), {
        headers: { ...corsHeaders(corsOrigin), 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'DELETE' && path) {
      await env.BUCKET.delete(path);
      return new Response('Deleted', { headers: corsHeaders(corsOrigin) });
    }

    return new Response('Tress Enterprise Storage API (Cloudflare R2)', { headers: corsHeaders(corsOrigin) });
  },
};

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
