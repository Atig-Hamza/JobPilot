import express from "express";
import { loginController, verifyTokenController } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginController);
router.post("/verify-token", verifyTokenController);

export default router;