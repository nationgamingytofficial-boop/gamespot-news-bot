const Parser = require("rss-parser");
const axios = require("axios");

const parser = new Parser();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function cleanText(text = "") {
    return text
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function snippet(text, length = 250) {
    const cleaned = cleanText(text);

    if (cleaned.length <= length) return cleaned;

    return cleaned.substring(0, length) + "...";
}

async function sendTelegram(message) {
    await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: "Markdown",
            disable_web_page_preview: false
        }
    );
}

async function main() {

    console.log("Fetching GameSpot RSS...");

    const feed = await parser.parseURL(
        "https://www.gamespot.com/feeds/news"
    );

    const latest = feed.items
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
        .slice(0, 5);

    for (const item of latest) {

        const message = `
🎮 *${cleanText(item.title)}*

📰 ${snippet(item.contentSnippet || item.content || item.summary || "")}

📅 ${item.pubDate}

🔗 ${item.link}
`;

        await sendTelegram(message);

        console.log("Sent:", item.title);
    }

    console.log("Done!");
}

main().catch(console.error);