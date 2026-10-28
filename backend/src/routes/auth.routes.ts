import { Router } from "express";

import { register, login, getCurrentUser, refresh, logout } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.get("/logout", logout);
authRouter.get("/me", authenticate, getCurrentUser);

export default authRouter;
