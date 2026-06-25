const Parser = require("rss-parser");
const fs = require("fs");

const parser = new Parser();

async function fetchNews() {
    try {
        console.log("Fetching GameSpot RSS Feed...");

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
                title: item.title,
                contentSnippet:
                    item.contentSnippet ||
                    item.content ||
                    item.summary ||
                    "",
                link: item.link,
                pubDate: item.pubDate,
                publishedAt: new Date(item.pubDate).toISOString()
            }));

        console.log("\n========== TOP 5 LATEST GAMESPOT NEWS ==========\n");

        latestNews.forEach(news => {
            console.log(`News #${news.id}`);
            console.log(`Title : ${news.title}`);
            console.log(`Published : ${news.pubDate}`);
            console.log(`Link : ${news.link}`);
            console.log(`Snippet : ${news.contentSnippet}`);
            console.log("---------------------------------------------\n");
        });

        fs.writeFileSync(
            "latest-news.json",
            JSON.stringify(latestNews, null, 2)
        );

        console.log("latest-news.json created successfully.");

    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

fetchNews();