import { Router } from "express";

import { register, login, getCurrentUser, refresh } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { get } from "node:http";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", authenticate, getCurrentUser);
authRouter.get("/auth/refresh", refresh);

export default authRouter;
