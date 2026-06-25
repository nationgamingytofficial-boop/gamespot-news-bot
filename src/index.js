const Parser = require("rss-parser");
const axios = require("axios");
const fs = require("fs");

const parser = new Parser();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const STORAGE = "./data/sent-links.json";

function clean(text = "") {
    return text
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function snippet(text, max = 350) {
    const t = clean(text);

    if (t.length <= max) return t;

    return t.substring(0, max) + "...";
}

function loadSentLinks() {
    if (!fs.existsSync(STORAGE)) {
        return [];
    }

    return JSON.parse(fs.readFileSync(STORAGE));
}

function saveSentLinks(data) {
    fs.writeFileSync(STORAGE, JSON.stringify(data, null, 2));
}

async function sendTelegram(message) {

    await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
            chat_id: CHAT_ID,
            text: message,
            disable_web_page_preview: false
        }
    );
}

async function main() {

    console.log("Fetching RSS...");

    const feed = await parser.parseURL(
        "https://www.gamespot.com/feeds/news"
    );

    let sentLinks = loadSentLinks();

    const latest = feed.items
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    let newArticles = [];

    for (const item of latest) {

        if (!sentLinks.includes(item.link)) {

            newArticles.push(item);

            sentLinks.push(item.link);
        }
    }

    if (newArticles.length === 0) {

        console.log("No new articles.");

        return;
    }

    console.log(`Found ${newArticles.length} new article(s).`);

    for (const item of newArticles) {

        const message =
`Create a Hamo2 Gaming Instagram post from this news:

Title:
${clean(item.title)}

Content:
${snippet(item.contentSnippet || item.content || item.summary || "")}

Published:
${item.pubDate}

Source:
${item.link}`;

        await sendTelegram(message);

        console.log("Sent:", item.title);
    }

    saveSentLinks(sentLinks);

    console.log("Finished.");
}

main().catch(console.error);