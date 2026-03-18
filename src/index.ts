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
    middlewareLoggedIn,
} from "./commands.ts";

async function main() {
    let registry: CommandRegistry = {};
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "users", handlerUsers);
    registerCommand(registry, "agg", handlerAgg);
    registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
    registerCommand(registry, "feeds", handlerFeeds);
    registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
    registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
    registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));
    registerCommand(registry, "browse", middlewareLoggedIn(handlerBrowse));
    registerCommand(registry, "reset", handlerReset);
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
