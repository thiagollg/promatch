import express from "express";
import { getActivityHistory, createVirtualClass } from "../controllers/activity.controller.js";
import { protectRoute } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/history", protectRoute, getActivityHistory);
router.post("/virtual-class", protectRoute, createVirtualClass);

export default router;
