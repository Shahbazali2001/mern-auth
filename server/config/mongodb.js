import mongoose from "mongoose";

const connectDB = async () =>{
    try {

        mongoose.connection.on("connected", () => {
            console.log("Connected to MongoDB");
        })
        
        await mongoose.connect(`${process.env.MONGO_URL}/mern-auth`);
        
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
    }
}

export default connectDB;