import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js"; // Adjust path as needed

export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        errorType: "auth_error",
        message: "Not authorized - token missing",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await userModel.findById(decoded.userId).select("password");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        errorType: "auth_error",
        message: "Not authorized - user not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        errorType: "auth_error",
        message: "Not authorized - invalid token",
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        errorType: "auth_error",
        message: "Not authorized - token expired",
      });
    }

    res.status(500).json({
      success: false,
      errorType: "server_error",
      message: "Internal Server Error",
    });
  }
};