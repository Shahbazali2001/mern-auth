import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";



const app = express();
const port = process.env.PORT || 4000;

connectDB();

const allowedOrigins = ["http://localhost:5173"];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow undefined origin for tools like Postman or mobile apps (optional)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// Middlewares 
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser({credentials : true}));


// API Endpoints
app.get("/", (req, res) => {
    res.send("Hello, API  is working fine");
    
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);























app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    
});