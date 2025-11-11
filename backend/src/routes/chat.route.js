import express from "express";
import { protectRoute } from "../../middleware/auth.middleware.js";
import { getStreamToken, getUnreadCounts, streamWebhook } from "../controllers/chat.controller.js";

const router = express.Router();


router.get("/token", protectRoute, getStreamToken);
router.get("/unread", protectRoute, getUnreadCounts);
// Webhook endpoint (sin autenticación, Stream lo llama directamente)
router.post("/webhook", streamWebhook);

export default router;

