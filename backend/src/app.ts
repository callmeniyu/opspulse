import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import incidentRoutes from "./routes/incident.routes.js";
import incidentMemberRoutes from "./routes/incident-member.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import taskRouter from "./routes/task.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/incidents", incidentMemberRoutes);
app.use("/api", taskRouter);

app.use(errorHandler);
export default app;
