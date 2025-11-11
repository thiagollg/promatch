import express from "express";
import { protectRoute } from "../../middleware/auth.middleware.js";
import { getAllRoles } from "../controllers/role.controller.js";
const router = express.Router();

router.use(protectRoute)


router.get("/allroles", getAllRoles)


export default router;
