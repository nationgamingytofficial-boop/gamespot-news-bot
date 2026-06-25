const Parser = require("rss-parser");
const fs = require("fs");

const parser = new Parser();

/**
 * Remove HTML tags and extra spaces
 */
function cleanText(text = "") {
    return text
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

/**
 * Limit text length
 */
function getSnippet(text = "", maxLength = 300) {
    const cleaned = cleanText(text);

    if (cleaned.length <= maxLength) {
        return cleaned;
    }

    return cleaned.substring(0, maxLength).trim() + "...";
}

async function fetchNews() {
    try {
        console.log("Fetching GameSpot RSS Feed...\n");

        const feed = await parser.parseURL(
            "https://www.gamespot.com/feeds/news"
        );

        if (!feed.items || feed.items.length === 0) {
            console.log("No news found.");
            return;
        }

        const latestNews = feed.items
            .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
            .slice(0, 5)
            .map((item, index) => ({
                id: index + 1,
                title: cleanText(item.title),
                contentSnippet: getSnippet(
                    item.contentSnippet ||
                    item.content ||
                    item.summary ||
                    item.contentEncoded ||
                    ""
                ),
                link: item.link,
                pubDate: item.pubDate,
                publishedAt: new Date(item.pubDate).toISOString()
            }));

        console.log("========== TOP 5 LATEST GAMESPOT NEWS ==========\n");

        latestNews.forEach(news => {
            console.log(`News #${news.id}`);
            console.log(`Title        : ${news.title}`);
            console.log(`Published    : ${news.pubDate}`);
            console.log(`Link         : ${news.link}`);
            console.log(`Summary      : ${news.contentSnippet}`);
            console.log("------------------------------------------------------------\n");
        });

        fs.writeFileSync(
            "./latest-news.json",
            JSON.stringify(latestNews, null, 2)
        );

        console.log("✅ latest-news.json created successfully.");

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

fetchNews();