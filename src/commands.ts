import { setUser, readConfig } from "./config.ts"
import { createUser, getUser, getUsers } from "./lib/db/queries/users.ts";
import { resetDatabase } from "./lib/db/queries/reset.ts";
import { DrizzleQueryError } from "drizzle-orm";
import { PostgresError } from "postgres";

type CommandHandler = (cmdName: string, ...args: Array<string>) => Promise<void>;
export type CommandRegistry = Record<string, {
    handler:CommandHandler,
    docstring:string,
    arguments: Record<string, string|undefined>,
    argsTotalLength: number,
}>;
type UserCommandHandler = (cmdName: string, user: User, ...args: Array<string>) => Promise<void>;

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async function (cmdName: string, ...args: Array<string>) : Promise<void> {
        let config = readConfig();
        let user = await getUser(config.currentUserName);
        return handler(cmdName, user, ...args);
    }
}

export function registerCommand(registry: CommandRegistry,
    cmdName: string, handler: CommandHandler,
    docstring: string, args: Record<string, string|undefined> = {}) {
    let argsTotalLength = 0
    let copiedArgs:Record<string, string|undefined> = {};
    for (let [key, value] of Object.entries(args)) {
        argsTotalLength += helpFormatArg(key, value).length;
        copiedArgs[key] = value;
    }
    registry[cmdName] = {handler, docstring, arguments: copiedArgs, argsTotalLength: argsTotalLength};
}

export async function runCommand(registry: CommandRegistry, cmdName: string, ...args: Array<string>) {
    let registered = registry[cmdName.toLowerCase()];
    const handler = registered.handler;
    if (handler !== undefined) {
        await handler(cmdName, ...args);
        if (Object.keys(registered.arguments).length !== args.length) {
            console.log("\nWarning: wrong number of arguments detected but the command handler didn't complain");
            console.log("This is either a bug in the documentation or the command handler");
        }
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
    if (queryResult?.name !== username) {
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
    if (args.length !== 1) {
        throw new Error("Expects exactly one argument");
    }
    let durationStr = args[0];
    let parsedInterval = durationStr.match(/^(\d+)(ms|s|m|h)$/);
    type IntervalSuffix = "ms"|"s"|"m"|"h";
    let intervalValues: Record<IntervalSuffix, number> = {
        ms: 1,
        s: 1000,
        m: 1000 * 60,
        h: 1000 * 60 * 60,
    };

    function isIntervalSuffix(suffix:string): suffix is IntervalSuffix {
        return (suffix in intervalValues)
    }
    if (parsedInterval === null) {
        throw new Error("Interval must be <digit>[ms|s|m|h]");
    }

    let units = parsedInterval[2];

    if (!isIntervalSuffix(units)) {
        throw new Error("Interval must be <digit>[ms|s|m|h]");
    }

    let intervalMiliseconds:number = Number(parsedInterval[1]) * intervalValues[units];

    console.log(`Collecting feeds every ${parsedInterval[0]}`);
    console.log(intervalMiliseconds);

    function handleError(error:string) {
        console.log(error);
    }
    scrapeFeeds().catch(handleError);

    const interval = setInterval(() => {
        scrapeFeeds().catch(handleError);
    }, intervalMiliseconds);

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        });
    });
    /*
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
    */
}

import { createFeed, getFeeds, getFeedByUrl } from "./lib/db/queries/feeds.ts"
import { type Feed, type User } from "./lib/db/schema.ts"
import { createFeedFollow, getFeedFollowsForUser, deleteFeedFollow } from "./lib/db/queries/feedFollows.ts"

export async function handlerAddFeed(cmdName: string, user: User, ...args: Array<string>) {
    if (args.length !== 2) {
        throw new Error("Expects exactly two arguments");
    }
    let name: string = args[0];
    let url: string = args[1];
    let feed = await createFeed(name, url, user.id);
    let followResult = await createFeedFollow(user.id, feed.id);
    console.log(`${followResult.users.name} is now following ${followResult.feeds.name}`);
    printFeed(feed, user);
}

export async function handlerFollow(cmdName: string, user: User, ...args: Array<string>) {
    if (args.length !== 1) {
        throw new Error("Expects exactly one argument");
    }
    let url = args[0];

    let feedResult = await getFeedByUrl(url)
    let feedId = feedResult.id;

    let userId = user.id;

    let followResult = await createFeedFollow(userId, feedId);
    console.log(`${followResult.users.name} is now following ${followResult.feeds.name}`);
}

export async function handlerFollowing(cmdName: string, user: User, ...args: Array<string>) {
    if (args.length !== 0) {
        throw new Error("Expects exactly zero arguments");
    }
    let config = readConfig();
    let follows = await getFeedFollowsForUser(user.id);
    for (let follow of follows) {
        console.log(`${follow.feeds.name}, ${follow.feeds.url}`);
    }
}

export async function handlerUnfollow(cmdName: string, user: User, ...args: Array<string>) {
    if (args.length !== 1) {
        throw new Error("Expects exactly one argument");
    }
    let url = args[0];

    let feedResult = await getFeedByUrl(url)
    let feedId = feedResult.id;

    let userId = user.id;

    let unfollowResult = await deleteFeedFollow(userId, feedId);
    if (unfollowResult != undefined) {
        console.log(`${user.name} has unfollowed ${feedResult.name}`);
    }
}

function printFeed(feed: Feed, user: User) {
    console.log(feed.name);
    console.log(user.name);
}

export async function handlerFeeds(cmdName: string, ...args: Array<string>) {
    if (args.length !== 0) {
        throw new Error("Expects exactly zero arguments");
    }
    let feeds = await getFeeds();
    for (let feed of feeds) {
        let lastFetched = feed.feeds.lastFetchedAt;
        let date:null|string = null;
        if (lastFetched) {
            date = `${lastFetched.getFullYear()}-${lastFetched.getMonth() + 1}-${lastFetched.getDate()} ${lastFetched.getHours()}:${lastFetched.getMinutes()}:${lastFetched.getSeconds()}`;
        }
        console.log(`[${feed.feeds.name}] (${feed.users.name})\n    ${feed.feeds.url}, last fetched: ${date}`);
    }
}

import { getNextFeedToFetch, markFeedFetched } from './lib/db/queries/feeds.ts'
import { createPost, getPostsForUser } from './lib/db/queries/posts.ts'

export async function handlerBrowse(cmdName: string, user: User, ...args: Array<string>) {
    if (args.length > 1) {
        console.log("Expected at most one argument");
    }

    let count:number = 2;
    if (args.length == 1) {
        count = Number(args[0]);
    }

    let posts = await getPostsForUser(user.id, count);
    for (let post of posts) {
        console.log(`\n${post.posts.title}`);
        console.log(`    ${post.feeds.name}: ${post.posts.url}`);
    }
}


export async function scrapeFeeds() {
    let [feed] = await getNextFeedToFetch();
    markFeedFetched(feed.id);
    console.log(`Scraping feed: ${feed.url}`);
    let feedData = await fetchFeed(feed.url);
    for (let data of feedData.channel.item) {
        console.log(`${data.title}`);
        let publishDate = new Date(data.pubDate);
        createPost(data.title, data.link, data.description, publishDate, feed.id);
    }
}

function helpFormatArg(arg:string, defaultValue: string|undefined) {
    if (defaultValue === undefined) {
        return ` <${arg}>`;
    }
    return ` [${arg} (default=${defaultValue})]`;
}

export function middlewareHelp(registry:CommandRegistry): CommandHandler {
    return async function(cmdName: string, ...args: Array<string>) {
        if (args.length !== 0) {
            throw new Error("Expects exactly zero arguments");
        }
        let longestCommandNameLength = 0;
        for (let [key, command] of Object.entries(registry)) {
            longestCommandNameLength =
                Math.max(longestCommandNameLength,
                    key.length + command.argsTotalLength);
        }
        console.log("==== Help ====");
        for (let [key, command] of Object.entries(registry)) {
            console.log();
            let commandPadding = longestCommandNameLength - 
                (key.length + command.argsTotalLength);
            let args = "";
            let sep = "    ";
            let substrings = command.docstring.split("\n");
            for (let [arg, defaultValue] of Object.entries(command.arguments)) {
                args = `${args}${helpFormatArg(arg, defaultValue)}`;
            }
            console.log(`${key}${args}${sep}${" ".repeat(commandPadding)}${substrings[0]}`);
            for (let substring of substrings.slice(1)) {
                console.log(`${" ".repeat(longestCommandNameLength + sep.length)}${substring}`);
            }
        }
    }
}
