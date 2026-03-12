import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "../config";

const conn = postgres(config.db.url);
