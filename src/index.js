const Parser = require("rss-parser");
const axios = require("axios");
const fs = require("fs");

const parser = new Parser();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const STORAGE = "./data/sent-links.json";

// ----------------------------
// Clean HTML
// ----------------------------
function clean(text = "") {
    return text
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

// ----------------------------
// Short summary
// ----------------------------
function snippet(text = "", max = 350) {
    const t = clean(text);

    if (t.length <= max) {
        return t;
    }

    return t.substring(0, max) + "...";
}

// ----------------------------
// Load sent links
// ----------------------------
function loadSentLinks() {

    if (!fs.existsSync(STORAGE)) {
        return [];
    }

    try {
        return JSON.parse(fs.readFileSync(STORAGE, "utf8"));
    } catch {
        return [];
    }
}

// ----------------------------
// Save sent links
// ----------------------------
function saveSentLinks(data) {
    fs.writeFileSync(STORAGE, JSON.stringify(data, null, 2));
}

// ----------------------------
// Telegram
// ----------------------------
async function sendTelegram(message) {

    await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
            chat_id: CHAT_ID,
            text: message,
            disable_web_page_preview: false
        },
        {
            timeout: 10000
        }
    );
}

// ----------------------------
// Main
// ----------------------------
async function main() {

    console.log("Fetching GameSpot RSS...");

    const feed = await parser.parseURL(
        "https://www.gamespot.com/feeds/news"
    );

    let sentLinks = loadSentLinks();

    // Only newest UNSENT articles
    const newArticles = feed.items
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
        .filter(item => !sentLinks.includes(item.link))
        .slice(0, 5);

    if (newArticles.length === 0) {

        console.log("No new articles.");

        return;
    }

    console.log(`Found ${newArticles.length} new article(s).\n`);

    for (const item of newArticles) {

        const message =
`Create a Hamo2 Gaming Instagram post from this news:

Title:
${clean(item.title)}

Content:
${snippet(
    item.contentSnippet ||
    item.content ||
    item.summary ||
    ""
)}

Published:
${item.pubDate}

Source:
${item.link}`;

        await sendTelegram(message);

        console.log("Sent:", item.title);

        // Save link after successful send
        sentLinks.push(item.link);
    }

    saveSentLinks(sentLinks);

    console.log("\nFinished.");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});