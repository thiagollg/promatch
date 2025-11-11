import express from "express";
import { protectRoute } from "../../middleware/auth.middleware.js";
import { getAllSubjects } from "../controllers/subject.controller.js";
const router = express.Router();

router.use(protectRoute)


router.get("/allsubjects", getAllSubjects)


export default router;
