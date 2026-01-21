import express from "express";
import { loginController, verifyTokenController, forgotPasswordController, resetPasswordController } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginController);
router.post("/verify-token", verifyTokenController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password/:token", resetPasswordController);

export default router;