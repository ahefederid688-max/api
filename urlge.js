export default function handler(req, res) {
  const targetUrl = process.env.REDIRECT_URL;
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ url: targetUrl });
}