import { Router } from "express";
import * as controller from "./dashboard.controller.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = Router();

router.use(authenticate);

// GET /api/dashboard — returns full dashboard for the authenticated user
router.get("/", controller.getDashboard);

export default router;
