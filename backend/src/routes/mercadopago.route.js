import express from "express";
import { connect, oauthCallback, getConnectionStatus, createPayment, webhook } from "../controllers/mercadopago.controller.js";
import { protectRoute } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/connect", protectRoute, connect);
router.get("/oauth/callback", oauthCallback);
router.get("/status", protectRoute, getConnectionStatus);
router.post("/payment/:professorId", protectRoute, createPayment);
router.post("/webhook", webhook); // Sin protección para que MP pueda llamarlo

export default router;


