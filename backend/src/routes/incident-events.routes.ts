import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as eventController from "../controllers/incident-events.controller.js";

const eventRouter = Router();

eventRouter.use(authenticate);

eventRouter.get("/:incidentId/events", eventController.list);

export default eventRouter;
