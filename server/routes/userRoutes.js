import express from "express";
import { getUserData } from "../controllers/userController.js";
import {authenticateToken} from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.get("/get-user-data", authenticateToken, getUserData);

export default userRouter;