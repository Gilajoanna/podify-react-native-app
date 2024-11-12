/* eslint-disable @typescript-eslint/no-unused-vars */
import EmailVerificationToken from "@/models/emailVerificationToken";
import nodemailer from "nodemailer";
import { MAILTRAP_PASS, MAILTRAP_USER, VERIFICATION_EMAIL } from "@/utils/variables";

const generateMailTransport = () => {
    return nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
        user: MAILTRAP_USER,
        pass: MAILTRAP_PASS,
        }
    });
}

interface Profile {
    name: string;
    email: string;
    userId: string;
}

export const sendVerificationEmail = async (token: string, profile: Profile) => {
    const transport = generateMailTransport();
    const {email, name} = profile;

    transport.sendMail({
        to: email,
        from: VERIFICATION_EMAIL,
        html: `<h1>Your verification token is: ${token}</h1>`,
    });
}