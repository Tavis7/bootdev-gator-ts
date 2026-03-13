import { db } from "..";
import { feedFollows, feeds, users } from "../schema";
import { eq, and } from "drizzle-orm";

export async function createFeedFollow(userId: string, feedId: string) {
    await db
        .insert(feedFollows)
        .values({userId: userId, feedId: feedId});
    const [result] = await db
        .select()
        .from(feedFollows)
        .innerJoin(feeds, eq(feeds.id, feedFollows.feedId))
        .innerJoin(users, eq(users.id, feedFollows.userId))
        .where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feedId)));
    return result;
}

export async function getFeedFollowsForUser(userName: string) {
    const result = await db
        .select()
        .from(feedFollows)
        .innerJoin(feeds, eq(feeds.id, feedFollows.feedId))
        .innerJoin(users, eq(users.id, feedFollows.userId))
        .where(eq(users.name, userName));
    return result;
}
