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
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists", success: false });
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
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h"});
    res.cookie("token", token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", 
      maxAge: 3600000 
    });

    //Sending welcome email
    try {
      const mailOptions ={
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
    return res.status(201).json({ message: "User registered successfully", success: true, token });



  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};



// Login a user
export const login = async (req, res) => {
  try{
        const { email, password } = req.body;
        if (!email || !password) {
          return res.status(400).json({ message: "Both Email and password are required", success: false });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
          return res.status(401).json({ message: "Invalid email", success: false });
        }

        const isMatch = await bcrypt.compare(password, user.password);
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
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


// Logout a user
export const logout = (req, res) => {
  try{
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.status(200).json({ message: "Logout successful", success: true });
  }catch(error){
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Email verification
export const sendVerifyOtp = async (req, res) => {
  try{
      const {userId} =req.body;
      const user = await userModel.findById(userId);
      if(!user){
        return res.status(404).json({success: false, message: "User not found"});
      }

      if(user.isAccountVerified){
        return res.status(400).json({success: false, message: "Account already verified"});
      }


      // Send OTP
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      user.verifyOTP = otp;
      user.verifyOTPExpireAt = Date.now() + 3600000; // 1 hour
      await user.save();
      console.log("OTP sent successfully");
      res.status(200).json({success: true, message: "OTP sent successfully"});

      // Send OTP via email
      const otpMailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "OTP Verification",
        text: `Your OTP is: ${otp}`,
      };
 
      await tranporter.sendMail(otpMailOptions);
      console.log("OTP sent via email successfully");
      res.status(200).json({success: true, message: "OTP sent via email successfully"});

  }catch(error){
    res.status(500).json({success: false, message: "Internal Server Error" });
  }
}


// Verify OTP
export const verifyEmail = async (req, res) => {
  try{
       const {userId, otp} = req.body;
       const user = await userModel.findById(userId);

       if(!user || !otp){
        return res.status(404).json({success: false, message: "User not found"});
       }
       if(user.isAccountVerified){
        return res.status(400).json({success: false, message: "Account already verified"});
       }
       if(user.verifyOTP !== otp || user.verifyOTP === ''){
        return res.status(400).json({success: false, message: "Invalid OTP"});
       }
       if(user.verifyOTPExpireAt < Date.now()){
        return res.status(400).json({success: false, message: "OTP expired"});
       }

       user.verifyOTP = '';
       user.verifyOTPExpireAt = 0;
       user.isAccountVerified = true;
       await user.save();
       res.status(200).json({success: true, message: "User verified successfully"});

  }catch(error){
    res.status(500).json({success: false, message: "Internal Server Error" });
  }
}