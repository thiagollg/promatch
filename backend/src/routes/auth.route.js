import express from "express";
import { singup, login, logout, onboard } from "../controllers/auth.controller.js";
import { protectRoute } from "../../middleware/auth.middleware.js";
const router = express.Router();

router.post("/signup", singup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/onboarding", protectRoute, onboard);


router.get("/me", protectRoute, async (req, res) => {
    try {
        // Poblar el rol y mercadopago del usuario
        await req.user.populate('role', 'name');
        await req.user.populate('mercadopago');
        res.status(200).json({success: true, message: "User logged in successfully", user: req.user})
    } catch (error) {
        console.error("Error in /auth/me:", error);
        return res.status(500).json({success: false, message: error.message})
    }
})
//router.get("/me", protectRoute, (req, res) => {
  //  res.status(200).json({success: true, message: "User logged in successfully", user: req.user})

export default router;