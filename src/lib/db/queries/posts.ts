import { db } from "..";
import { posts, feeds, feedFollows, users } from "../schema";
import { eq, desc } from "drizzle-orm";

export async function createPost(title: string, url: string,
    description: string, publishedAt: Date, feedId: string) {

    const [result] = await db
        .insert(posts)
        .values({
            title: title,
            url: url,
            description: description,
            publishedAt: publishedAt,
            feedId: feedId
        })
        .returning();
    return result;
}

export async function getPostsForUser(userId: string, count: number) {
    const result = await db
        .select()
        .from(posts)
        .innerJoin(feeds, eq(posts.feedId, feeds.id))
        .innerJoin(feedFollows, eq(feeds.id, feedFollows.feedId))
        .innerJoin(users, eq(users.id, feedFollows.userId))
        .orderBy(desc(posts.publishedAt))
        .limit(count);
    return result;
}
