import { validate } from "@/middleware/validator";
import { CreateUserSchema, EmailVerificationBody } from "@/utils/validationSchema";
import { create, sendReVerificationToken, verifyEmail } from "@/controllers/userController";
import { Router } from "express";

const router = Router();

router.post(
  "/register",
  validate(CreateUserSchema),
  create
);

router.post("/verify-email", 
validate(EmailVerificationBody), 
verifyEmail);

router.post("/re-verify-email", 
validate(EmailVerificationBody), 
sendReVerificationToken);

export default router;
