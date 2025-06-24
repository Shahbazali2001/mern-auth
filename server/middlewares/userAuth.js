import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "Not authorized", success: false });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (decodedToken.id) {
      req.body.userId = decodedToken.id;
      next();
    }else{
      return res.status(401).json({ message: "Not authorized", success: false });
    }

  } catch (error) {
    console.error("Error in userAuth middleware:", error);
  }
};

export default userAuth;
