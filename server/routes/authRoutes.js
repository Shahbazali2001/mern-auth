import express from "express";
import { login, logout, register, sendVerifyOtp, verifyEmail, isAuthenticated, sendResetOtp, resetPassword, getCurrentUser } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/reset-password", resetPassword); // Rest Password
router.post("/send-reset-otp", sendResetOtp);  // Send Reset Password OTP
router.post("/send-verify-otp", authenticateToken, sendVerifyOtp);  // Send Email Verification OTP
router.post("/verify-email", authenticateToken, verifyEmail);  // Verify Email Using OTP
router.get("/is-verified", authenticateToken, isAuthenticated);

router.get("/me", authenticateToken, getCurrentUser); // Protected route


export default router;
