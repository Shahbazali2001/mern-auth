import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        success: false,
        errorType: "unauthorized",
        message: "Not authorized - token missing",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach userId to request object (NOT req.body)
    req.userId = decodedToken.id;

    next();
  } catch (error) {
    console.error("Error in userAuth middleware:", error);
    return res.status(500).json({
      success: false,
      errorType: "auth_middleware_error",
      message: "Authentication failed due to a server error",
    });
  }
};

export default userAuth;
