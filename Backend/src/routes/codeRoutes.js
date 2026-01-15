import { createInviteCode, createCreditCode } from "../controllers/codeController.js";
import { Router } from "express";

const router = Router();

router.post("/invite", createInviteCode);
router.post("/credit", createCreditCode);

export default router;