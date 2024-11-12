import { CreateUser } from "@/@types/userType";
import { RequestHandler } from "express";
import User from "@/models/user";
import { generateToken } from "@/utils/helper";
import { sendVerificationEmail } from "@/utils/mail";

export const create: RequestHandler =   
async (req: CreateUser, res) => {
  const { email, password, name } = req.body;

  const user = await User.create({ name, email, password });

  // send verification email
  const token = generateToken();
  sendVerificationEmail(token, { email, name, userId: user._id.toString() });

  res.status(200).json({ user: {id: user._id, name, email} });
}