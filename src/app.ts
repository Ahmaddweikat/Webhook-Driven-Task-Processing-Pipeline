import express from "express";
import authRoutes from "./api/auth.routes";

export const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
