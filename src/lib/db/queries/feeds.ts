import { db } from "..";
import { feeds, users } from "../schema";
import { eq } from "drizzle-orm";

export async function createFeed(name: string, url: string, userId: string) {
    const [result] = await db
        .insert(feeds)
        .values({name: name, url: url, user_id: userId})
        .returning();
    return result;
}

export async function getFeeds() {
    const result = await db
        .select()
        .from(feeds)
        .innerJoin(users, eq(users.id, feeds.user_id))
    return result;
}

export async function getFeedByUrl(url: string) {
    const [result] = await db
        .select()
        .from(feeds)
        .where(eq(feeds.url, url));
    return result;
}
