import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.userId; 
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({
          success: false,
          errorType: "user_not_found",
          message: "User not found",
        });
    }
    res.status(200).json({
      success: true,
      statusType: "user_fetch_success",
      userData: {
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
      },
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
