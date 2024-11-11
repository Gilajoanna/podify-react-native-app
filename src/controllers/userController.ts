import { CreateUser } from "@/@types/userType";
import { RequestHandler } from "express";
import User from "@/models/user";
import EmailVerificationToken from "@/models/emailVerificationToken";
import nodemailer from "nodemailer";
import { MAILTRAP_PASS, MAILTRAP_USER } from "@/utils/variables";
import { generateToken } from "@/utils/helper";

export const create: RequestHandler =   
async (req: CreateUser, res) => {
  const { email, password, name } = req.body;

  const user = await User.create({ name, email, password });

    const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
        user: MAILTRAP_USER,
        pass: MAILTRAP_PASS,
        }
    });

    const token = generateToken();
    await EmailVerificationToken.create({ owner: user._id, token });

    transport.sendMail({
        to: user.email,
        from: "auth@myapp.com",
        html: `<h1>Your verification token is: ${token}</h1>`,
    });

  res.status(200).json({ user });
}