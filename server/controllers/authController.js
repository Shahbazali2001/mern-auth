import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import userModel from "../models/userModel.js";
import tranporter from "../config/nodeMailer.js";

dotenv.config();

// Register a new user
export const register = async (req, res) => {
  try {
    // Validate request body
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Token creation
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 3600000,
    });

    //Sending welcome email
    try {
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Welcome to our website",
        text: `Hello ${name}, Welcome to our website. We are glad to have you here.`,
      };

      await tranporter.sendMail(mailOptions);
      console.log("Welcome email sent successfully");
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't return error here - user registration was successful
    }

    // Send the token in the response
    return res
      .status(201)
      .json({ message: "User registered successfully", success: true, token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        errorType: "missing_fields",
        message: "Both email and password are required.",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        errorType: "invalid_email",
        message: "Invalid email address.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        errorType: "invalid_password",
        message: "Invalid password",
      });
    }

    // Token creation
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/", // Ensure cookie is available on all paths
    });

    res.status(200).json({
      success: true,
      statusType: "login_success",
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      errorType: "server_error",
      message: "Internal Server Error",
    });
  }
};

// Logout a user
export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.status(200).json({
      success: true,
      statusType: "logout_success",
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      errorType: "server_error",
      message: "Internal Server Error",
    });
  }
};

// Email verification
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.user._id; // user id will be get from token
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        errorType: "user_not_found",
        message: "User not found",
      });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({
        success: false,
        errorType: "account_already_verified",
        message: "Account is already verified.",
      });
    }

    // Send OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOTP = otp;
    user.verifyOTPExpireAt = Date.now() + 3600000; // 1 hour
    await user.save();
    console.log("OTP sent successfully");
    res.status(200).json({
      success: true,
      statusType: "otp_sent",
      message: "OTP sent successfully",
    });

    // Send OTP via email
    const otpMailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "OTP Verification",
      text: `Your OTP is: ${otp}`,
    };

    await tranporter.sendMail(otpMailOptions);
    console.log("OTP sent via email successfully");
    res.status(200).json({
      success: true,
      statusType: "otp_email_sent",
      message: "OTP sent via email successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errorType: "server_error",
      message: "Internal Server Error",
    });
  }
};

// Verify OTP
export const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body; // user id will be get from token and otp will be get from user input
    const userId = req.user._id;
    const user = await userModel.findById(userId);

    if (!user || !otp) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.isAccountVerified) {
      return res.status(400).json({
        success: false,
        errorType: "account_already_verified",
        message: "Account already verified",
      });
    }
    if (user.verifyOTP !== otp || user.verifyOTP === "") {
      return res.status(400).json({
        success: false,
        errorType: "invalid_otp",
        message: "Invalid OTP",
      });
    }
    if (user.verifyOTPExpireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        errorType: "otp_expired",
        message: "OTP has expired",
      });
    }

    user.verifyOTP = "";
    user.verifyOTPExpireAt = 0;
    user.isAccountVerified = true;
    await user.save();
    res.status(200).json({
      success: true,
      statusType: "user_verified",
      message: "User verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errorType: "server_error",
      message: "Internal Server Error",
    });
  }
};

// Check authentication
export const isAuthenticated = async (req, res) => {
  try {
    const userId = req.user._id; // user id will be get from token
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        errorType: "user_not_found",
        message: "User not found",
      });
    }
    if (!user.isAccountVerified) {
      return res.status(401).json({
        success: false,
        errorType: "user_not_verified",
        message: "User not verified",
      });
    }
    res.status(200).json({
      success: true,
      statusType: "user_authenticated",
      message: "User authenticated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errorType: "server_error",
      message: "Internal Server Error",
    });
  }
};

//Send OTP for Password Reset
export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body; // email will be get from user input
    if (!email) {
      return res
        .status(400)
        .json({
          success: false,
          errorType: "email_required",
          message: "Email is required",
        });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({
          success: false,
          errorType: "user_not_found",
          message: "User not found",
        });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOTP = otp;
    user.resetOTPExpireAt = Date.now() + 3600000; // 1 hour
    await user.save();
    

    // Send OTP via email
    const resetOtpMailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP is: ${otp}`,
    };
    await tranporter.sendMail(resetOtpMailOptions);
    console.log("OTP sent via email successfully");
    retrun 
    res
      .status(200)
      .json({
        success: true,
        statusType: "otp_email_sent",
        message: "OTP sent via email successfully",
      });
  } catch (error) {
    
    res
      .status(500)
      .json({
        success: false,
        errorType: "server_error",
        message: "Internal Server Error",
      });
  }
};

// Verify OTP and Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body; // email will be get from user input
    if (!email || !otp || !password) {
      return res
        .status(400)
        .json({
          success: false,
          errorType: "missing_fields",
          message: "All fields are required",
        });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({
          success: false,
          errorType: "user_not_found",
          message: "User not found",
        });
    }
    if (user.resetOTP === "" || user.resetOTP !== otp) {
      return res
        .status(400)
        .json({
          success: false,
          errorType: "invalid_otp",
          message: "Invalid OTP",
        });
    }
    if (user.resetOTPExpireAt < Date.now()) {
      return res
        .status(400)
        .json({
          success: false,
          errorType: "otp_expired",
          message: "OTP expired",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetOTP = "";
    user.resetOTPExpireAt = 0;
    await user.save();
    res
      .status(200)
      .json({
        success: true,
        statusType: "password_reset_success",
        message: "Password reset successfully",
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        errorType: "server_error",
        message: "Internal Server Error",
      });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by middleware
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      errorType: "server_error",
      message: "Internal Server Error",
    });
  }
};
