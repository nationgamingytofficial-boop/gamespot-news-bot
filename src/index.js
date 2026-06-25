const Parser = require("rss-parser");

const parser = new Parser();

async function main() {
  try {
    console.log("Fetching GameSpot RSS...");

    const feed = await parser.parseURL(
      "https://www.gamespot.com/feeds/news"
    );

    console.log(`Feed Title: ${feed.title}`);
    console.log(`Found ${feed.items.length} articles\n`);

    const latest = feed.items.slice(0, 5);

    latest.forEach((item, index) => {
      console.log("==================================");
      console.log(`News #${index + 1}`);
      console.log("Title:", item.title);
      console.log("Snippet:", item.contentSnippet || item.content || "");
      console.log("Link:", item.link);
      console.log("Published:", item.pubDate);
      console.log();
    });

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();