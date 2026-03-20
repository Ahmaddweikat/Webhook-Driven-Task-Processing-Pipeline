import { app } from "./app";
import { config } from "./config";
import dotenv from "dotenv";
dotenv.config();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log("JWT_SECRET loaded:", config.jwtSecret); // ← add this
});
