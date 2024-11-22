import {
  create,
  generateForgetPasswordLink,
  grantValid,
  sendReVerificationToken,
  updatePassword,
  verifyEmail,
} from "@/controllers/userController";
import { isValidPassWordResetToken } from "@/middleware/auth";
import { validate } from "@/middleware/validator";
import {
  CreateUserSchema,
  TokenAndIDValidation,
  UpdatePasswordSchema,
} from "@/utils/validationSchema";
import { Router } from "express";

const router = Router();

router.post("/register-user", validate(CreateUserSchema), create);

router.post("/verify-email", validate(TokenAndIDValidation), verifyEmail);

router.post("/re-verify-email", sendReVerificationToken);

router.post("/forget-password", generateForgetPasswordLink);

router.post(
  "/verify-password-reset-token",
  validate(TokenAndIDValidation),
  isValidPassWordResetToken,
  grantValid
);

router.post(
  "/update-password",
  validate(UpdatePasswordSchema),
  isValidPassWordResetToken,
  updatePassword
);

export default router;
