export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 8080,
  jwtSecret: process.env.JWT_SECRET || "",
  databaseUrl: process.env.DATABASE_URL || "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  nodeEnv: process.env.NODE_ENV || "development",
};
