import { setUser, readConfig} from "./config.ts";
import { type CommandRegistry, registerCommand, runCommand } from "./commands.ts";
import {
    handlerLogin,
    handlerRegister,
    handlerUsers,
    handlerAgg,
    handlerAddFeed,
    handlerFeeds,
    handlerFollow,
    handlerFollowing,
    handlerUnfollow,
    handlerBrowse,

    handlerReset,
    middlewareHelp,
    middlewareLoggedIn,
} from "./commands.ts";

async function main() {
    let registry: CommandRegistry = {};
    registerCommand(registry, "login", handlerLogin,
        "Log in",
        {"username": undefined});
    registerCommand(registry, "register", handlerRegister,
        "Register user",
        {"username": undefined});
    registerCommand(registry, "users", handlerUsers,
        "List users");
    registerCommand(registry, "agg", handlerAgg,
        "Run the aggregator in the background to refresh\n"+
            "all the added RSS feeds.\n\n"+
            "The interval is an integer with a\n"+
            "'ms', 's', 'm', or 'h' suffix for milliseconds,\n"+
            "seconds, minutes, or hours.\n\n"+
            "For example, ten minutes would be written 10m.",
        {"interval": undefined});
    registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed),
        "Add and follow a feed",
        {
            "feed name": undefined,
            "url": undefined,
        });
    registerCommand(registry, "feeds", handlerFeeds,
        "List feeds");
    registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow),
        "Follow a feed", {"url": undefined});
    registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing),
        "List feeds you are following");
    registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow),
        "Unfollow a feed", {"url": undefined});
    registerCommand(registry, "browse", middlewareLoggedIn(handlerBrowse),
        "List recent articles from feeds you are following", {"count": "2"});
    registerCommand(registry, "help", middlewareHelp(registry),
        "Print this help menu");
    registerCommand(registry, "--reset-database", handlerReset,
        "Reset the database. May need to be prefixed with an\n"+
            "extra '--', like './gator -- --reset-database'.");
    let args = process.argv.slice(2);
    if (args.length <= 0) {
        console.log("Error: expected a command");
        process.exit(1);
    }
    try {
        await runCommand(registry, args[0], ...args.slice(1));
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        } else {
            console.log(error);
        }
    }
    process.exit(0);
}

main();
