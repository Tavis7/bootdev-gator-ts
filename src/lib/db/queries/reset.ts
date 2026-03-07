import { db } from "..";
import { users } from "../schema";

export async function resetDatabase() {
    const result = await db.delete(users).returning();
    return result;
}
