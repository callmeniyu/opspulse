import { Router } from "express";

import { create, list, getById, update, changeStatus } from "../controllers/incident.controller.js";

import { authenticate } from "../middleware/auth.js";

const incidentRouter = Router();

incidentRouter.use(authenticate);

incidentRouter.post("/", create);
incidentRouter.get("/", list);
incidentRouter.get("/:id", getById);
incidentRouter.put("/:id", update);
incidentRouter.patch("/:id/status", changeStatus);

export default incidentRouter;
