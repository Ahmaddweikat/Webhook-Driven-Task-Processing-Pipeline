// server.ts
import dotenv from "dotenv";
require("dotenv").config();

import { app } from "./app";
import { config } from "./config"; // now config.jwtSecret is set

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log("JWT_SECRET loaded:", config.jwtSecret.length, "chars");
});
