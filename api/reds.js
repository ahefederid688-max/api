export const config = {
  runtime: 'edge',
};

async function sendTelegramLog(request) {
  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;
    const IPDATA_API_KEY = process.env.IPDATA_API_KEY;

    const ip = request.headers.get('x-forwarded-for') || 'IP not found';
    const userAgent = request.headers.get('user-agent') || 'UA not found';

    const ipdataResponse = await fetch(`https://api.ipdata.co/${ip}?api-key=${IPDATA_API_KEY}`);
    const data = await ipdataResponse.json();

    const getFlagEmoji = (countryCode) => {
      if (!countryCode || countryCode.length !== 2) return '🏳️';
      const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
      return String.fromCodePoint(...codePoints);
    };
    
    const flag = data.emoji_flag || getFlagEmoji(data.country_code);
    
    const message = [
      `${flag} New Visit [Edge]:`,
      `IP: ${data.ip || 'N/A'}`,
      `Location: ${data.country_name || 'N/A'}, ${data.region || 'N/A'}, ${data.city || 'N/A'}`,
      `Provider: ${data.asn ? data.asn.name : 'N/A'}`,
      `Threat: Proxy: ${data.threat ? data.threat.is_proxy : 'N/A'}, Tor: ${data.threat ? data.threat.is_tor : 'N/A'}`,
      `User-Agent: ${userAgent}`
    ].join('\n');

    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`;

    const telegramResponse = await fetch(telegramUrl);
    
    if (!telegramResponse.ok) {
        const errorData = await telegramResponse.json();
        console.error("Telegram API Error:", errorData);
    } else {
        console.log("Telegram log sent successfully in background.");
    }
  } catch (error) {
    console.error("Background tracking task failed:", error);
  }
}

export default function handler(request, event) {
  const REDIRECT_URL = process.env.REDIRECT_URL;
  
  event.waitUntil(sendTelegramLog(request));

  return Response.redirect(REDIRECT_URL, 307);
}
