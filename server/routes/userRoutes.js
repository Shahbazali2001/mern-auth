import express from "express";
import { getUserData } from "../controllers/userController.js";
import userAuth from "../middlewares/userAuth.js";

const userRouter = express.Router();

userRouter.get("/get-user-data", userAuth, getUserData);

export default userRouter;