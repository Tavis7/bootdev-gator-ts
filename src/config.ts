import os from "os";
import path from "path";
import fs from "fs";

type Config = {
    dbUrl: string;
    currentUserName: string;
}

export function setUser(username: string) {
    let currentConfig:Config = readConfig();

    let configPath = getConfigFilePath();
    let configFile = fs.openSync(configPath, "w");
    let configString = JSON.stringify({
        db_url : currentConfig.dbUrl,
        current_user_name : username,
    });
    fs.writeFileSync(configFile, configString);
    fs.closeSync(configFile);
}

export function readConfig(): Config {
    let configPath = getConfigFilePath();
    let configFileContents = fs.readFileSync(configPath, {encoding: "utf8"});
    let parsedJson:any;
    parsedJson = JSON.parse(configFileContents);
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
