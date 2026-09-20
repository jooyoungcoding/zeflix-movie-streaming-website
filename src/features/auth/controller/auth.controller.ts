import {
  SignUpRequest,
  SignUpResponse,
  LoginRequest,
  LoginResponse,
} from "../auth.type";
import {
  signUpService,
  loginService,
  googleLoginService,
  exchangeCodeForSessionService,
  getCurrentUserService,
  logoutService,
  getUserProfileService,
} from "../service/auth.service";
import {
  findProfileByUsername,
  findProfileByEmail,
} from "../repository/auth.repository";
import { Profile } from "@/types/Profile";

export const signUpController = async (
  data: SignUpRequest
): Promise<SignUpResponse> => {
  const username = data?.username?.trim();
  const email = data?.email?.trim().toLowerCase();
  const password = data?.password;

  // 1. Validation Logic
  if (!username) {
    throw new Error("Username is required");
  }

  if (username.length < 3 || username.length > 30) {
    throw new Error("Username must be between 3 and 30 characters");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid email address is required");
  }

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  // 2. Check existence
  const existingUserByUsername = await findProfileByUsername(username);
  if (existingUserByUsername) {
    throw new Error("Username is already taken");
  }

  const existingUserByEmail = await findProfileByEmail(email);
  if (existingUserByEmail) {
    throw new Error("Email is already registered");
  }

  // 3. Call Service
  return await signUpService({
    username,
    email,
    password,
  });
};

export const loginController = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const email = data?.email?.trim().toLowerCase();
  const password = data?.password;

  // 1. Validation Logic
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid email address is required");
  }

  if (!password) {
    throw new Error("Password is required");
  }

  // 2. Call Service
  return await loginService({
    email,
    password,
  });
};

export const googleLoginController = async (): Promise<string> => {
  return await googleLoginService();
};

export const exchangeCodeForSessionController = async (
  code: string
): Promise<void> => {
  if (!code?.trim()) {
    throw new Error("Authorization code is required");
  }

  return await exchangeCodeForSessionService(code.trim());
};

export const getCurrentUserController = async (): Promise<{
  user: { id: string; email?: string };
  profile: Profile | null;
} | null> => {
  return await getCurrentUserService();
};

export const logoutController = async (): Promise<void> => {
  return await logoutService();
};

export const getUserProfileController = async (
  userId: string
): Promise<Profile | null> => {
  const id = userId?.trim();
  if (!id) {
    throw new Error("User ID is required");
  }

  return await getUserProfileService(id);
};


