import express from "express";
import { protectRoute } from "../../middleware/auth.middleware.js";
import { getMyProffessors, createConnection, getProfessorById, checkConnectionStatus, searchProfessors, deleteCurrentUser, getSimilarProfessors, getRecommendedProfessorsBySubjects} from "../controllers/user.controller.js";

const router = express.Router();

router.use(protectRoute)


router.get("/proffesorsconnected", getMyProffessors);
router.put("/professor/:id/connect", createConnection);
//router.get("/similar", getRecommendedProffessors);
router.get("/recommended-by-subjects", getRecommendedProfessorsBySubjects);
router.get("/professors/search", searchProfessors);
router.get("/professor/:id", getProfessorById);
router.delete("/me", deleteCurrentUser);
router.get("/professor/:id/connection-status", checkConnectionStatus);
router.get("/professor/:id/similar", getSimilarProfessors);

export default router;