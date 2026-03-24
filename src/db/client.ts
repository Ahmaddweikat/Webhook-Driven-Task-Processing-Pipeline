import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { config } from "../config";

const conn = postgres(config.databaseUrl);
export const db = drizzle(conn, { schema });
