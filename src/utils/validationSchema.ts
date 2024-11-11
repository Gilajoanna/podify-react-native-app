import * as yup from "yup";

export const CreateUserSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .min(3, "Name is too short")
    .max(30, "Name is too long"),

  email: yup.string().email("Invalid email").required("Email is required"),

  password: yup
    .string()
    .trim()
    .required("Password is missing")
    .min(8, "Password is too short")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      "Password must contain at least 8 characters, one letter, one number and one special character"
    ),
});
