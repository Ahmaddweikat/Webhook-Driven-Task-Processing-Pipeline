import dotenv from "dotenv";
dotenv.config();

import { config } from "./config";

if (!config.jwtSecret) throw new Error("JWT_SECRET is missing!");

import { app } from "./app";

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log("JWT_SECRET loaded:", config.jwtSecret.length, "chars");
});
