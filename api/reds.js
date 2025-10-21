const getFlagEmoji = (countryCode) => {
    if (!countryCode || countryCode.length !== 2) return '🏳️';
    const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
};

export default async function handler(req, res) {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;
    const IPDATA_API_KEY = process.env.IPDATA_API_KEY;
    const REDIRECT_URL = process.env.REDIRECT_URL;

    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        const ipdataResponse = await fetch(`https://api.ipdata.co/${ip}?api-key=${IPDATA_API_KEY}`);
        const data = await ipdataResponse.json();
        
        const flag = data.emoji_flag || getFlagEmoji(data.country_code);

        const message = `
${flag} New Visit [Vercel]:
IP: ${data.ip}
Location: ${data.country_name}, ${data.region}, ${data.city}
Provider: ${data.asn.name}
Threat: Proxy: ${data.threat.is_proxy}, Tor: ${data.threat.is_tor}
User-Agent: ${userAgent}
        `;
        
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`;
        fetch(telegramUrl);

    } catch (error) {
        console.error("Tracking failed:", error);
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ redirectTo: REDIRECT_URL });
}




