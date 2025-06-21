

import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";


const app = express();
const port = process.env.PORT || 4000;

connectDB();

// Middlewares 
app.use(express.json());
app.use(cors());
app.use(cookieParser({credentials : true}));

app.get("/", (req, res) => {
    res.send("Hello, API  is working fine");
    
});






















app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    
});