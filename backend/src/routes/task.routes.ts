import { Router } from "express";
import * as taskController from "../controllers/task.controller.js";
import { authenticate } from "../middleware/auth.js";

const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.post("/incidents/:incidentId/tasks", taskController.create);
taskRouter.get("/incidents/:incidentId/tasks", taskController.list);

taskRouter.patch("/tasks/:taskId", taskController.update);
taskRouter.delete("/tasks/:taskId", taskController.remove);

export default taskRouter;
