import { setUser, readConfig} from "./config.ts";
import { type CommandRegistry, registerCommand, runCommand } from "./commands.ts";
import {
    handlerLogin,
    handlerRegister,
    handlerReset,
    handlerUsers,
    handlerAgg,
    handlerAddFeed,
    handlerFeeds,
} from "./commands.ts";

async function main() {
    let registry: CommandRegistry = {};
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "users", handlerUsers);
    registerCommand(registry, "agg", handlerAgg);
    registerCommand(registry, "addfeed", handlerAddFeed);
    registerCommand(registry, "feeds", handlerFeeds);
    registerCommand(registry, "reset", handlerReset);
    let args = process.argv.slice(2);
    if (args.length <= 0) {
        console.log("Error: expected a command");
        process.exit(1);
    }
    await runCommand(registry, args[0], ...args.slice(1));
    process.exit(0);
}

main();
