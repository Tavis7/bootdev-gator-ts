import { setUser, readConfig} from "./config.ts";
import { type CommandRegistry, registerCommand, runCommand, handlerLogin } from "./commands.ts";

function main() {
    let registry: CommandRegistry = {};
    registerCommand(registry, "login", handlerLogin);
    let args = process.argv.slice(2);
    if (args.length <= 0) {
        console.log("Error: expected a command");
        process.exit(1);
    }
    runCommand(registry, args[0], ...args.slice(1));
}

main();
