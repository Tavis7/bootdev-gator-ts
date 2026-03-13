import { setUser, readConfig } from "./config.ts"
import { createUser, getUser, getUsers } from "./lib/db/queries/users.ts";
import { resetDatabase } from "./lib/db/queries/reset.ts";
import { DrizzleQueryError } from "drizzle-orm";
import { PostgresError } from "postgres";

type CommandHandler = (cmdName: string, ...args: Array<string>) => Promise<void>;
export type CommandRegistry = Record<string, CommandHandler>;

export function registerCommand(registry: CommandRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandRegistry, cmdName: string, ...args: Array<string>) {
    const handler = registry[cmdName];
    if (handler !== undefined) {
        await handler(cmdName, ...args);
    } else {
        throw new Error(`Unknown command: ${cmdName}`);
    }
}

export async function handlerLogin(cmdName: string, ...args: Array<string>) {
    if (args.length !== 1) {
        throw new Error("Expects exactly one argument");
    }

    let username = args[0];
    const queryResult = await getUser(username);
    if (queryResult.name !== username) {
        throw new Error(`User '${username}' does not exist`);
    }
    await setUser(username);
    console.log(`Set username to ${username}`);
}

export async function handlerRegister(cmdName: string, ...args: Array<string>) {
    if (args.length !== 1) {
        throw new Error("Expects exactly one argument");
    }

    let username = args[0];
    let registered = await createUser(username);

    await setUser(username);
    console.log(`Registered user ${registered.name}`);
}

export async function handlerReset(cmdName: string, ...args: Array<string>) {
    if (args.length !== 0) {
        throw new Error("Expects exactly zero arguments");
    }
    await resetDatabase();
    console.log("Successfully reset database");
}

export async function handlerUsers(cmdName: string, ...args: Array<string>) {
    if (args.length !== 0) {
        throw new Error("Expects exactly zero arguments");
    }

    let conf = readConfig();
    const queryResult = await getUsers();
    for (let result of queryResult) {
        let marker = '';
        if (conf.currentUserName === result.name) {
            marker = ' (current)';
        }
        console.log(` * ${result.name}${marker}`);
    }
}

import { fetchFeed } from "./feed.ts"
export async function handlerAgg(cmdName: string, ...args: Array<string>) {
    let feed = await fetchFeed("https://www.wagslane.dev/index.xml");
    console.log(`${feed.channel.title}`);
    console.log(`${feed.channel.link}`);
    console.log(`${feed.channel.description}`);
    for (let item of feed.channel.item) {
        console.log(`   ${item.title}`);
        console.log(`   ${item.link}`);
        console.log(`   ${item.description}`);
        console.log(`   ${item.pubDate}`);
    }
}

import { createFeed, getFeeds, getFeedByUrl } from "./lib/db/queries/feeds.ts"
import { type Feed, type User } from "./lib/db/schema.ts"
import { createFeedFollow, getFeedFollowsForUser } from "./lib/db/queries/feedFollows.ts"

export async function handlerAddFeed(cmdName: string, ...args: Array<string>) {
    if (args.length !== 2) {
        throw new Error("Expects exactly two arguments");
    }
    let name: string = args[0];
    let url: string = args[1];
    let config = readConfig();
    let user = await getUser(config.currentUserName);
    let feed = await createFeed(name, url, user.id);
    let followResult = await createFeedFollow(user.id, feed.id);
    printFeed(feed, user);
}

export async function handlerFollow(cmdName: string, ...args: Array<string>) {
    if (args.length !== 1) {
        throw new Error("Expects exactly one argument");
    }
    let url = args[0];
    let config = readConfig();

    let feedResult = await getFeedByUrl(url)
    let feedId = feedResult.id;

    let userResult = await getUser(config.currentUserName);
    let userId = userResult.id;

    let followResult = await createFeedFollow(userId, feedId);
    console.log(`${followResult.users.name} is now following ${followResult.feeds.name}`);
}

export async function handlerFollowing(cmdName: string, ...args: Array<string>) {
    if (args.length !== 0) {
        throw new Error("Expects exactly zero arguments");
    }
    let config = readConfig();
    let follows = await getFeedFollowsForUser(config.currentUserName);
    for (let follow of follows) {
        console.log(`${follow.feeds.name}, ${follow.feeds.url}`);
    }
}

function printFeed(feed: Feed, user: User) {
    console.log(`${user.name} created feed ${feed.name}`);
}

export async function handlerFeeds(cmdName: string) {
    let feeds = await getFeeds();
    for (let feed of feeds) {
        console.log(`[${feed.feeds.name}] (${feed.users.name})\n    ${feed.feeds.url}`);
    }
}
