import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const tranporter = nodemailer.createTransport({
    service: "gmail",
    // port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
});

export default tranporter;