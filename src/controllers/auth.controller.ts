import { Request, Response } from "express";
import { prisma } from "../prisma";
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
} from "../utils/auth.utils";
import { OAuth2Client } from "google-auth-library";
import { v4 as uuidv4 } from "uuid";
import { Prisma, User } from "@prisma/client";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/email.utils";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userData = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      emailConfirmed: false,
    };
    const user = await prisma.user.create({
      data: userData,
    });

    // Generate verification token and send email
    const verificationToken = generateToken(user.id, "24h");
    await sendVerificationEmail(user.email, verificationToken);

    // Generate JWT token
    const token = generateToken(user.id);
    const refresh_token = generateToken(user.id, "30d");

    res.status(201).json({
      message: req.t("auth.registration.success"),
      user: {
        id: user.id,
        email: user.email,
      },
      token,
      refresh_token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: req.t("auth.registration.error") });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user?.password) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.id , '2h');
    const refresh_token = generateToken(user.id, "30d");

    res.status(200).json({
      message: req.t("auth.login.success"),
      session: {
        token,
        refresh_token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: req.t("auth.login.error") });
  }
};

export const googleAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token: idToken } = req.body;

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      res.status(400).json({ error: "Invalid Google token" });
      return;
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: uuidv4(),
          email: payload.email,
        },
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(200).json({
      message: req.t("auth.google.success"),
      session: {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ error: req.t("auth.google.error") });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  // With JWT, we don't need to do anything server-side for logout
  // The client should remove the token
  res.status(200).json({ message: req.t("auth.logout.success") });
};

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (await prisma.user.findUnique({
      // @ts-ignore
      where: { id: req.user.id },
      include: {
        ownedOrganizations: true,
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    })) as User | null;

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userResponse = { ...user, password: undefined };

    res.status(200).json({
      data: userResponse,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: req.t("auth.profile.error") });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    // Verify refresh token
    const user = await verifyToken(refresh_token);
    if (!user) {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    // Generate new JWT token
    const token = generateToken(user.id);

    res.status(200).json({
      message: req.t("auth.token.success"),
      session: {
        token,
        user_id: user.id,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ error: req.t("auth.token.refreshError") });
  }
};

export const checkEmailVerification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      // @ts-ignore
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      emailConfirmed: !!user.emailConfirmed,
      email: user.email,
    });
  } catch (error) {
    console.error("Email verification check error:", error);
    res.status(500).json({ error: req.t("auth.email.verificationCheckError") });
  }
};

export const resendVerificationEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Generate verification token and send email
    const verificationToken = generateToken(user.id, "24h");
    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({
      message: req.t("auth.email.verificationSent"),
    });
  } catch (error) {
    console.error("Resend verification email error:", error);
    res.status(500).json({ error: req.t("auth.email.verificationError") });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { access_token } = req.query;

    // Verify token
    const user = await verifyToken(access_token as string);
    if (!user) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    // Update user email confirmation
    await prisma.user.update({
      where: { id: user.id },
      data: { emailConfirmed: true },
    });

    res.status(200).json({
      message: req.t("auth.email.verificationSuccess"),
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ error: req.t("auth.email.verificationFailed") });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Generate reset token and send email
    const resetToken = generateToken(user.id, "1h");
    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      message: req.t("auth.forgotPassword.success"),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: req.t("auth.forgotPassword.error") });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { password } = req.body;

    // Hash password and update user
    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      // @ts-ignore
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      message: req.t("auth.resetPassword.success"),
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: req.t("auth.resetPassword.error") });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;

    // Update user profile
    await prisma.user.update({
      // @ts-ignore
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phoneNumber,
      },
    });

    res.status(200).json({
      message: req.t("auth.profile.updateSuccess"),
      profile: {
        firstName,
        lastName,
        phoneNumber,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: req.t("auth.profile.updateError") });
  }
};

export const updateEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    // Update user email
    await prisma.user.update({
      // @ts-ignore
      where: { id: req.user.id },
      data: { email },
    });

    res.status(200).json({
      message: req.t("auth.email.updateSuccess"),
    });
  } catch (error) {
    console.error("Update email error:", error);
    res.status(500).json({ error: req.t("auth.email.updateError") });
  }
};
