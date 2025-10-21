// --- "ЖЕЛЕЗНАЯ" ВЕРСИЯ ---

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
        // --- ШАГ 1: ПОЛУЧЕНИЕ ДАННЫХ ---
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        const ipdataResponse = await fetch(`https://api.ipdata.co/${ip}?api-key=${IPDATA_API_KEY}`);
        if (!ipdataResponse.ok) {
            throw new Error(`ipdata API error: ${ipdataResponse.status}`);
        }
        const data = await ipdataResponse.json();
        
        // --- ШАГ 2: ОТПРАВКА В TELEGRAM И ОЖИДАНИЕ ОТВЕТА ---
        const flag = data.emoji_flag || getFlagEmoji(data.country_code);
        const message = `${flag} New Visit [Vercel2]:\nIP: ${data.ip}\nLocation: ${data.country_name}, ${data.region}, ${data.city}\nProvider: ${data.asn.name}\nThreat: Proxy: ${data.threat.is_proxy}, Tor: ${data.threat.is_tor}\nUser-Agent: ${userAgent}`;
        
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`;
        
        const telegramResponse = await fetch(telegramUrl);
        
        // --- ШАГ 3: ПРОВЕРКА ОТВЕТА ОТ TELEGRAM ---
        if (!telegramResponse.ok) {
            const errorJson = await telegramResponse.json();
            throw new Error(`Telegram API error: ${telegramResponse.status} - ${JSON.stringify(errorJson)}`);
        }
        
        console.log("Telegram message sent successfully and confirmed.");

    } catch (error) {
        // Если любой из шагов выше не удался, мы логируем ошибку, но НЕ ломаем редирект.
        console.error("Tracking process failed:", error);
    } finally {
        // --- ШАГ 4: ГАРАНТИРОВАННЫЙ РЕДИРЕКТ ---
        // Этот блок выполнится ВСЕГДА: и после успешной отправки, и после ошибки.
        // Пользователь в любом случае будет перенаправлен.
        console.log(`Redirecting to: ${REDIRECT_URL}`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json({ redirectTo: REDIRECT_URL });
    }
}
