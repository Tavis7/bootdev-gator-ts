import { defineConfig } from "drizzle-kit";
import { readConfig } from "./src/config.ts";

let config = readConfig();
console.log(config);
export default defineConfig({
    schema: "src/schema.ts",
    out: "src/lib/db",
    dialect: "postgresql",
    dbCredentials: {
        url: config.dbUrl,
    },
});
