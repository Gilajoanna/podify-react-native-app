import { CreateUser, VerifyEmailRequest } from "@/@types/userType";
import { RequestHandler } from "express";
import User from "@/models/user";
import { generateToken } from "@/utils/helper";
import { sendVerificationEmail } from "@/utils/mail";
import EmailVerificationToken from "@/models/emailVerificationToken";
import { isValidObjectId } from "mongoose";

/***** CREATE USER *****/
export const create: RequestHandler =   
async (req: CreateUser, res) => {
  const { email, password, name } = req.body;

  const user = await User.create({ name, email, password });

  // send verification email
  const token = generateToken();
  EmailVerificationToken.create({
    owner: user._id,
    token
  });

  sendVerificationEmail(token, { email, name, userId: user._id.toString() });

  res.status(200).json({ user: {id: user._id, name, email} });
}

/***** VERIFY EMAIL *****/

export const verifyEmail: RequestHandler =   
async (req: VerifyEmailRequest, res) => {
  // 1. Destructuring the token and userId from the request body
  const { token, userId } = req.body;
  // 2. Finding the verification token in the database by the owner's userId 
  const verificationToken = await EmailVerificationToken.findOne({ 
    owner: userId
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
    verified: true 
  });
  // 7. Deleting the verification token from the database.
  await EmailVerificationToken.findByIdAndDelete(verificationToken._id);
  // 8. Sending a success message
  res.json({ message: "Email verified" });
}

/***** RE-SEND TOKEN *****/ // THIS IS NOT WORKING IN POSTMAN. Check later on

export const sendReVerificationToken: RequestHandler =   
async (req, res) => {
  const { userId } = req.body;
  // Finding the user by the userId
  const user = await User.findById(userId);
  // Sending a error message if the user is not found or the userId is invalid
  if (!user || !isValidObjectId(userId)) {
    return res.status(403).json({ message: "Invalid request" });
  }

  // Finding the previous token by the owner's userId and deleting it
  await EmailVerificationToken.findOneAndDelete({ 
    owner: userId 
  });
  // Generating a new token
  const token = generateToken();
  EmailVerificationToken.create({
    owner: userId,
    token
  });

  sendVerificationEmail(token, {
    email: user?.email ?? '',
    name: user?.name ?? '',
    userId: user?._id.toString() ?? ''
  });

  res.json({ message: "Token is re-sent." });
};