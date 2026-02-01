import { createInviteCode, createCreditCode, getInviteCodes, deleteInviteCode, redeemCreditCode, sendCredits } from "../controllers/codeController.js";
import { Router } from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/create-invite", protect, restrictTo('admin'), createInviteCode);
router.get("/invite-codes", protect, restrictTo('admin'), getInviteCodes);
router.delete("/invite-codes/:id", protect, restrictTo('admin'), deleteInviteCode);
router.post("/create-credit", protect, restrictTo('admin'), createCreditCode);
router.post("/redeem", protect, redeemCreditCode);
router.post("/send-credits", protect, sendCredits);

export default router;