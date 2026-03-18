import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: Array<RSSItem>;
    };
};

type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
    console.log(`Fetching ${feedURL}`);
    const response = await fetch(feedURL, {
        headers: {
            "User-Agent": "gator",
        }
    });
    if (!response.ok) {
        throw new Error(`Bad response: ${response.status}`);
    }
    const responseText = await response.text();
    const parser = new XMLParser();
    const parsed = parser.parse(responseText);
    if (parsed.rss.channel) {
        const channel = parsed.rss.channel;
        if (typeof channel.title === "string" &&
            typeof channel.link === "string" &&
            typeof channel.description === "string") {

            let items = [];

            if (Array.isArray(channel.item)) {
                items = channel.item;
            } else if (typeof channel.item === "object") {
                items.push(channel.item);
            }

            let resultItems: Array<RSSItem> = [];
            for (let item of items) {
                if (typeof item.title === "string" &&
                    typeof item.link === "string" &&
                    typeof item.description === "string" &&
                    typeof item.pubDate === "string") {
                    resultItems.push({
                        title: item.title,
                        link: item.link,
                        description: item.description,
                        pubDate: item.pubDate,
                    });
                }
            }

            const result: RSSFeed = {
                channel: {
                    title: parsed.title,
                    link: parsed.link,
                    description: parsed.description,
                    item: resultItems,
                },
            };
            return result;
        }
    }
    throw new Error("Failed to fetch feed");
}
