import express from "express";
import { protectRoute } from "../../middleware/auth.middleware.js";
import { getAllLocations } from "../controllers/location.controller.js";
const router = express.Router();

router.use(protectRoute)


router.get("/alllocations", getAllLocations)


export default router;