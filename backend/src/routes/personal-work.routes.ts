import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as personalWorkController from "../controllers/personal-work.controller.js";

const personalWorkRouter = Router();

personalWorkRouter.use(authenticate);

personalWorkRouter.get("/tasks/mine", personalWorkController.myTasks);
personalWorkRouter.get("/teams/mine", personalWorkController.myTeams);

export default personalWorkRouter;
