import { Router } from "express";
import * as taskController from "../controllers/task.controller.js";
import { authenticate } from "../middleware/auth.js";
import app from "../app.js";

const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.post("/incidents/:incidentId/tasks", taskController.create);
taskRouter.get("/incidents/:incidentId/tasks", taskController.list);

taskRouter.patch("/tasks/:taskId", taskController.update);

export default taskRouter;
