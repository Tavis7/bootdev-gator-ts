import os from "os";
import path from "path";
import fs from "fs/promises";

type Config = {
    dbUrl: string;
    currentUserName: string;
}

export async function setUser(username: string) {
    let currentConfig:Config = await readConfig();

    let configPath = getConfigFilePath();
    let configFile = await fs.open(configPath, "w");
    let configString = await JSON.stringify({
        db_url : currentConfig.dbUrl,
        current_user_name : username,
    });
    await configFile.writeFile(configString);
    await configFile.close();
}

export async function readConfig(): Promise<Config> {
    let configPath = getConfigFilePath();
    let configFile = await fs.open(configPath);
    let configFileContents = await configFile.read();
    await configFile.close();
    let configJson = await configFileContents.buffer.toString(
        'utf8', 0, configFileContents.bytesRead
    );
    let parsedJson:any;
    parsedJson = await JSON.parse(configJson);
    return validateConfig(parsedJson);
}

function validateConfig(config: any): Config {
    let result: Config = {
        dbUrl: "",
        currentUserName: "",
    };
    if (typeof config === "object") {
        if (typeof config.db_url === "string") {
            result.dbUrl = config.db_url;
        }
        if (typeof config.current_user_name === "string") {
            result.currentUserName = config.current_user_name;
        }
    }
    return result;
}

function getConfigFilePath() {
    let home = os.homedir();
    let configPath = path.join(home, ".gatorconfig.json");
    return configPath;
}
