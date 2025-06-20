// https://github.com/Shahbazali2001/mern-auth.git
// https://github.com/shahbazali2001/mern-auth.git

import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";


const app = express();
const port = process.env.PORT || 4000;

// Middlewares 
app.use(express.json());
app.use(cors());
app.use(cookieParser({credentials : true}));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});