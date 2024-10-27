import { Router } from "express";
import authRoutes from "./authRoutes.js";
import verifyRoutes from "./verifyRoutes.js"
import { authlimiter } from "../config/rateLimit.js";
import clashRoutes from "./clashRoutes.js"
import authMiddleware from "../middleware/authMiddleware.js";
const router = Router();

router.use("/api/auth",authlimiter, authRoutes);
router.use("/", verifyRoutes);
router.use("/api/clash",authMiddleware,clashRoutes)
export default router;