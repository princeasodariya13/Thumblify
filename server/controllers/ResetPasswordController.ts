import { Request, Response } from "express";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import User from "../models/User.js";

// ─────────────────────────────────────────────
// 📩  STEP 1 — Send OTP to email
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send email via Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Thumblify Support" <${process.env.EMAIL}>`,
      to: email,
      subject: "🔐 Your Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #0f0f0f; border-radius: 12px; color: #fff;">
          <h2 style="color: #ec4899; margin-bottom: 8px;">Password Reset</h2>
          <p style="color: #aaa; font-size: 14px;">Use the OTP below to reset your password. It expires in <strong>5 minutes</strong>.</p>
          <div style="margin: 28px 0; text-align: center;">
            <span style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #ec4899;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 12px;">If you didn't request this, ignore this email. Your password stays unchanged.</p>
        </div>
      `,
    });

    return res.json({ message: "OTP sent to your email" });
  } catch (error: any) {
    console.error("❌ forgotPassword error:", error);
    return res.status(500).json({ message: "Failed to send OTP. Try again." });
  }
};

// ─────────────────────────────────────────────
// 🔐  STEP 2 — Verify OTP
// POST /api/auth/verify-otp
// ─────────────────────────────────────────────
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (error: any) {
    console.error("❌ verifyOtp error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// 🔁  STEP 3 — Reset Password
// POST /api/auth/reset-password
// ─────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword, otp } = req.body;

    if (!email || !newPassword || !otp) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please restart the process." });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.json({ message: "Password reset successfully! You can now log in." });
  } catch (error: any) {
    console.error("❌ resetPassword error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
