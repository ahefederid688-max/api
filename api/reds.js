export const config = {
  runtime: 'edge',
};

export default function handler(request) {
  const REDIRECT_URL = process.env.REDIRECT_URL;


  return new Response(JSON.stringify({ redirectTo: REDIRECT_URL }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
