import { setUser } from "./config.ts"

type CommandHandler = (cmdName: string, ...args: Array<string>) => void;
export type CommandRegistry = Record<string, CommandHandler>;

export function registerCommand(registry: CommandRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export function runCommand(registry: CommandRegistry, cmdName: string, ...args: Array<string>) {
    const handler = registry[cmdName];
    if (handler !== undefined) {
        handler(cmdName, ...args);
    } else {
        throw new Error(`Unknown command: ${cmdName}`);
    }
}

export function handlerLogin(cmdName: string, ...args: Array<string>) {
    if (args.length !== 1) {
        throw new Error("Expects exactly one argument");
    }

    let username = args[0];
    setUser(username);
    console.log(`Set username to ${username}`);
}


