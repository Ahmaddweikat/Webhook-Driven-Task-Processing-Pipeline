import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET!,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
  db: {
    url: process.env.DATABASE_URL!,
  },
};
