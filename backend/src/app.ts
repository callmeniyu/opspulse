import express from "express";
import cors from "cors";
import { testConnection } from "./db/testConnection.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import incidentRoutes from "./routes/incident.routes.js";
import incidentMemberRoutes from "./routes/incident-member.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/incidents", incidentMemberRoutes);

app.use(errorHandler);
export default app;
