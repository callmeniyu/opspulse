import { authenticate } from "../middleware/auth.js";
import * as incidentMemberController from "../controllers/incident-members.controller.js";
import { Router } from "express";

const incidentMemeberRouter = Router();

incidentMemeberRouter.use(authenticate);

incidentMemeberRouter.get("/:incidentId/member-candidates", incidentMemberController.findCandidate);
incidentMemeberRouter.get("/:incidentId/members", incidentMemberController.list);
incidentMemeberRouter.patch("/:incidentId/members/:userId", incidentMemberController.updateRole);
incidentMemeberRouter.post("/:incidentId/members", incidentMemberController.add);
incidentMemeberRouter.delete("/:incidentId/members/:userId", incidentMemberController.remove);

export default incidentMemeberRouter;
