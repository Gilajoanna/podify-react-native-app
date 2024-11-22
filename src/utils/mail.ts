/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  MAILTRAP_PASS,
  MAILTRAP_USER,
  VERIFICATION_EMAIL,
} from "@/utils/variables";
import nodemailer from "nodemailer";

// Sending mails with nodemailer for testing purposes

const generateMailTransport = () => {
  return nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASS,
    },
  });
};

interface Profile {
  name: string;
  email: string;
  userId: string;
}

export const sendVerificationEmail = async (
  token: string,
  profile: Profile
) => {
  const transport = generateMailTransport();
  const { email, name } = profile;

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Verify your email",
    html: `<h1>Your verification token is: ${token}</h1>`,
  });
};

interface Options {
  email: string;
  link: string;
}

export const sendForgetPasswordLink = async (options: Options) => {
  const transport = generateMailTransport();
  const { email, link } = options;

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Reset Password",
    html: `<h1>Follow this link to reset your password: ${link}</h1>`,
  });
};

export const sendPassResetSuccessEmail = async (email: string) => {
  const transport = generateMailTransport();

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Password reset successfully",
    html: `<h1>You password is now successfully changed!</h1>`,
  });
};
