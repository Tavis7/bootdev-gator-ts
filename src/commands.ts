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
