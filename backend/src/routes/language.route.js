import express from "express";
import { protectRoute } from "../../middleware/auth.middleware.js";
import { getAllLanguages } from "../controllers/language.controller.js";
const router = express.Router();

router.use(protectRoute)


router.get("/alllanguages", getAllLanguages)


export default router;
