export const config = {
  runtime: 'edge',
};

export default function handler(request) {
  const REDIRECT_URL = process.env.REDIRECT_URL;
  return Response.redirect(REDIRECT_URL, 307);
}
