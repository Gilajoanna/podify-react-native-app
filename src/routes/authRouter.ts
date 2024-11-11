import { validate } from "@/middleware/validator";
import { CreateUserSchema } from "@/utils/validationSchema";
import { create } from "@/controllers/userController";
import { Router } from "express";

const router = Router();

router.post(
  "/register",
  validate(CreateUserSchema),
  create
);

export default router;
