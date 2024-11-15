import { RequestHandler } from "express";
import PasswordResetToken from "@/models/passwordResetToken";

// Middleware to check if the password reset token is valid

export const isValidPassWordResetToken: RequestHandler = async (req, res, next) => {
    const { token, userId } = req.body;
    
    const resetToken = await PasswordResetToken.findOne({
      owner: userId
    });
    if (!resetToken) {
      return res.status(403).json({ message: "Unauthorized access, invalid token." });
    };
  
  const matched = await resetToken.compareToken(token);
  if(!matched) {
    return res.status(403).json({ message: "Unauthorized access, invalid token." });
  }
  
  next();
  };