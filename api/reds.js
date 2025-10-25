export const config = {
  runtime: 'edge',
};

export default function handler(request) {
  const REDIRECT_URL = process.env.REDIRECT_URL;

  if (!REDIRECT_URL) {
    return new Response('Redirect URL not configured.', { status: 500 });
  }

  const html = `<!DOCTYPE html><html><head><script>window.location.replace("${REDIRECT_URL}");</script></head><body></body></html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
