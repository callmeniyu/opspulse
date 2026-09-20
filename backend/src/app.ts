import express from "express";
import cors from "cors";
import { testConnection } from "./db/testConnection.js";

const app = express();

app.use(cors());
app.use(express.json());

testConnection();
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "opspulse-api" });
});

export default app;
