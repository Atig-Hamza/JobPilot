import express from "express";
import { loginController, verifyTokenController, forgotPasswordController, resetPasswordController, login2FAController, sendLoginOTPController, googleLoginController } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginController);
router.post("/google", googleLoginController);
router.post("/2fa/login", login2FAController);
router.post("/2fa/send-otp", sendLoginOTPController);
router.post("/verify-token", verifyTokenController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password/:token", resetPasswordController);

export default router;