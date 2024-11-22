import {
  CreateUser,
  UpDdatePassword,
  VerifyEmailRequest,
} from "@/@types/userType";
import EmailVerificationToken from "@/models/emailVerificationToken";
import PasswordResetToken from "@/models/passwordResetToken";
import User from "@/models/user";
import { generateToken } from "@/utils/helper";
import {
  sendForgetPasswordLink,
  sendPassResetSuccessEmail,
  sendVerificationEmail,
} from "@/utils/mail";
import { PASSWORD_RESET_LINK } from "@/utils/variables";
import crypto from "crypto";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

/***** CREATE USER *****/

export const create: RequestHandler = async (req: CreateUser, res) => {
  const { email, password, name } = req.body;

  const user = await User.create({ name, email, password });

  // send verification email
  const token = generateToken();
  EmailVerificationToken.create({
    owner: user._id,
    token,
  });

  sendVerificationEmail(token, { email, name, userId: user._id.toString() });

  res.status(200).json({ user: { id: user._id, name, email } });
};

/***** VERIFY EMAIL *****/

export const verifyEmail: RequestHandler = async (
  req: VerifyEmailRequest,
  res
) => {
  // 1. Destructuring the token and userId from the request body
  const { token, userId } = req.body;
  // 2. Finding the verification token in the database by the owner's userId
  const verificationToken = await EmailVerificationToken.findOne({
    owner: userId,
  });
  // 3. Sending a error message if the verification token is not found
  if (!verificationToken) {
    return res.status(400).json({ message: "Invalid token" });
  }
  // 4. Comparing the token from the request body with the token from the database. Returns a boolean.
  const matched = await verificationToken.compareToken(token);
  // 5. Sending a error message if the tokens do not match
  if (!matched) {
    return res.status(400).json({ message: "Invalid token" });
  }
  // 6. Updating the user's verified in the database to true. Email is validated.
  await User.findByIdAndUpdate(userId, {
    verified: true,
  });
  // 7. Deleting the verification token from the database.
  await EmailVerificationToken.findByIdAndDelete(verificationToken._id);
  // 8. Sending a success message
  res.json({ message: "Email verified" });
};

/***** RE-SEND TOKEN WHEN TOKEN EXPIRED *****/

export const sendReVerificationToken: RequestHandler = async (req, res) => {
  const { userId } = req.body;
  // Finding the user by the userId
  const user = await User.findById(userId);
  // Sending a error message if the user is not found or the userId is invalid
  if (!user || !isValidObjectId(userId)) {
    return res.status(403).json({ message: "Invalid request" });
  }

  // Finding the previous token by the owner's userId and deleting it
  await EmailVerificationToken.findOneAndDelete({
    owner: userId,
  });
  // Generating a new token
  const token = generateToken();
  EmailVerificationToken.create({
    owner: userId,
    token,
  });

  sendVerificationEmail(token, {
    email: user?.email ?? "",
    name: user?.name ?? "",
    userId: user?._id.toString() ?? "",
  });

  res.json({ message: "Token is re-sent." });
};

/***** FORGET PASSWORD *****/

export const generateForgetPasswordLink: RequestHandler = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "Account not found." });
  }

  // We always have to delete existing tokens before creating a new one.
  await PasswordResetToken.findOneAndDelete({
    owner: user._id,
  });

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  PasswordResetToken.create({
    owner: user._id,
    token,
  });
  // Generate link
  const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;

  sendForgetPasswordLink({ email: user.email, link: resetLink });
  res.json({ message: "Reset link is sent to your mail.", resetLink });
};

/***** VERIFY PASSWORD RESET TOKEN FOR RE-SENDING PASSWORD LINK *****/

export const grantValid: RequestHandler = async (req, res) => {
  res.json({ message: "Token is valid." });
};

/***** UPDATE NEW PASSWORD *****/
export const updatePassword: RequestHandler = async (
  req: UpDdatePassword,
  res
) => {
  const { userId, password } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "Account not found." });
  }

  const matched = await user.comparePassword(password);
  if (matched) {
    return res.status(400).json({ message: "Password cannot be the same." });
  }

  user.password = password;
  await user.save();

  await PasswordResetToken.findOneAndDelete({
    owner: user._id,
  });
  //send success email
  sendPassResetSuccessEmail(user.email);
  res.json({ message: "Password updated successfully." });
};
