import { db } from "..";
import { feeds, users } from "../schema";
import { type uuid } from "drizzle-orm/pg-core";
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
