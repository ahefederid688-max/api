// --- ОТЛАДОЧНАЯ ВЕРСИЯ ---

const getFlagEmoji = (countryCode) => {
    if (!countryCode || countryCode.length !== 2) return '🏳️';
    const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
};

export default async function handler(req, res) {
    console.log("--- Function started ---");

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;
    const IPDATA_API_KEY = process.env.IPDATA_API_KEY;
    const REDIRECT_URL = process.env.REDIRECT_URL;

    // ЛОГ 1: Проверяем, что переменные вообще загрузились
    console.log(`BOT_TOKEN loaded: ${!!BOT_TOKEN}`);
    console.log(`CHAT_ID loaded: ${!!CHAT_ID}`);
    console.log(`REDIRECT_URL loaded: ${!!REDIRECT_URL}`);

    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        // ЛОГ 2: Проверяем IP и User Agent
        console.log(`IP: ${ip}, UA: ${userAgent}`);

        const ipdataResponse = await fetch(`https://api.ipdata.co/${ip}?api-key=${IPDATA_API_KEY}`);
        if (!ipdataResponse.ok) {
            // Если ipdata вернул ошибку, логируем ее
            const errorText = await ipdataResponse.text();
            throw new Error(`ipdata API error: ${ipdataResponse.status} ${errorText}`);
        }
        const data = await ipdataResponse.json();
        
        // ЛОГ 3: Логируем ответ от ipdata
        console.log("Received data from ipdata:", JSON.stringify(data, null, 2));
        
        const flag = data.emoji_flag || getFlagEmoji(data.country_code);
        const message = `${flag} New Visit [Vercel]:\nIP: ${data.ip}\nLocation: ${data.country_name}, ${data.region}, ${data.city}\nProvider: ${data.asn.name}\nThreat: Proxy: ${data.threat.is_proxy}, Tor: ${data.threat.is_tor}\nUser-Agent: ${userAgent}`;
        
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`;
        
        // ЛОГ 4: Показываем URL, который мы отправляем в Telegram
        console.log("Sending to Telegram URL:", telegramUrl.replace(BOT_TOKEN, "TOKEN_HIDDEN"));

        const telegramResponse = await fetch(telegramUrl);
        if (!telegramResponse.ok) {
            // Если Telegram вернул ошибку, логируем ее
            const errorJson = await telegramResponse.json();
            throw new Error(`Telegram API error: ${telegramResponse.status} ${JSON.stringify(errorJson)}`);
        }

        console.log("Telegram message sent successfully.");

    } catch (error) {
        // ЛОГ 5: САМЫЙ ВАЖНЫЙ ЛОГ! Показываем точную ошибку
        console.error("!!! TRACKING FAILED !!!:", error);
    }

    console.log("--- Sending redirect response ---");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ redirectTo: REDIRECT_URL });
}
