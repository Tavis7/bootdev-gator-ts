import { setUser, readConfig} from "./config.ts";
import { type CommandRegistry, registerCommand, runCommand, handlerLogin } from "./commands.ts";

async function main() {
    console.log("Hello, world!");
    let registry: CommandRegistry = {};
    registerCommand(registry, "login", handlerLogin);
    console.log(process.argv);
    let args = process.argv.slice(2);
    if (args.length <= 0) {
        console.log("Error: expected a command");
        process.exit(1);
    }
    console.log(args);
    runCommand(registry, args[0], ...args.slice(1));
}

await main();
