import bycrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import userModel from "../models/userModel.js";


dotenv.config();

// Register a new user
export const register = async (req, res) => {
  try {
    // Validate request body
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists", success: false });
    }

    // Hash the password
    const hashedPassword = await bycrypt.hash(password, 10);

    // Create a new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    // return res.status(201).json({ message: "User registered successfully", success: true });

    // Token creation
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h"});
    res.cookie("token", token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", 
      maxAge: 3600000 
    });

    res.status(201).json({ message: "User registered successfully", success: true, token });



  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// Login a user
export const login = async (req, res) => {
  try{
        const { email, password } = req.body;
        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required", success: false });
        }

        const user = await userModel.findOne({ email });
        if (!User) {
          return res.status(401).json({ message: "Invalid email", success: false });
        }

        const isMatch = await bycrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid password", success: false });
        }

        // Token creation
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { 
          httpOnly: true, 
          secure: process.env.NODE_ENV === "production", 
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", 
          maxAge: 3600000 
        });

        res.status(200).json({ message: "Login successful", success: true });

  }catch(error){

    res.status(500).json({ message: "Internal Server Error" });
  
  }
}