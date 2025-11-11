import express from "express";
import { protectRoute } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/multer.js";
import { uploadAvatar } from "../controllers/cloudinary.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/upload", upload.single("avatar"), uploadAvatar);

export default router;
