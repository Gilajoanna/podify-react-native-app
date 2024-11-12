import { validate } from "@/middleware/validator";
import { CreateUserSchema, TokenAndIDValidation } from "@/utils/validationSchema";
import { create, generateForgetPasswordLink, grantValid, sendReVerificationToken, verifyEmail } from "@/controllers/userController";
import { Router } from "express";
import { isValidPassWordResetToken } from "@/middleware/auth";

const router = Router();

router.post(
  "/register",
  validate(CreateUserSchema),
  create
);

router.post("/verify-email", 
validate(TokenAndIDValidation), 
verifyEmail
);

router.post("/re-verify-email", 
sendReVerificationToken
);

router.post("/forget-password", 
generateForgetPasswordLink
);

router.post("/verify-password-reset-token", 
validate(TokenAndIDValidation),
isValidPassWordResetToken,
grantValid
);

export default router;
