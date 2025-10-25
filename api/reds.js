export const config = {
  runtime: 'edge',
};

export default function handler(request) {
  const REDIRECT_URL = process.env.REDIRECT_URL;

  if (!REDIRECT_URL) {
    return new Response('Redirect URL not configured.', { status: 500 });
  }

  return new Response(null, {
    status: 307,
    headers: {
      'Location': REDIRECT_URL,
    },
  });
}
