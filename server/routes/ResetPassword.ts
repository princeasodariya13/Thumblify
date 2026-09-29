import express from "express";
import {
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../controllers/ResetPasswordController.js";

const router = express.Router();

// No auth middleware on these routes (public)
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;