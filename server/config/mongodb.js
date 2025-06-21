import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        // Check if MONGO_URL exists
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL environment variable is not defined");
        }

        // Validate connection string format
        if (!process.env.MONGO_URL.startsWith('mongodb://') && !process.env.MONGO_URL.startsWith('mongodb+srv://')) {
            throw new Error("Invalid MongoDB connection string format. Must start with 'mongodb://' or 'mongodb+srv://'");
        }

        mongoose.connection.on("connected", () => {
            console.log("Connected to MongoDB");
        });

        mongoose.connection.on("error", (err) => {
            console.log("MongoDB connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("MongoDB disconnected");
        });
        
        await mongoose.connect(process.env.MONGO_URL);
        
    } catch (error) {
        console.log("Error connecting to MongoDB:", error.message);
        console.log("MONGO_URL value:", process.env.MONGO_URL);
        process.exit(1);
    }
};

export default connectDB;
