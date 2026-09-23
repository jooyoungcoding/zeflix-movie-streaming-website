import {
  SignUpRequest,
  SignUpResponse,
  LoginRequest,
  LoginResponse,
} from "../auth.type";
import {
  signUpRepository,
  loginRepository,
  googleLoginRepository,
  exchangeCodeForSessionRepository,
  getCurrentUserRepository,
  logoutRepository,
  findProfileById,
  findProfileByEmail,
} from "../repository/auth.repository";
import { Profile } from "@/types/Profile";

export const signUpService = async (
  data: SignUpRequest,
  originUrl?: string
): Promise<SignUpResponse> => {
  return await signUpRepository(data, originUrl);
};

export const loginService = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  return await loginRepository(data);
};

export const googleLoginService = async (): Promise<string> => {
  return await googleLoginRepository();
};

export const exchangeCodeForSessionService = async (
  code: string
): Promise<void> => {
  return await exchangeCodeForSessionRepository(code);
};

export const getCurrentUserService = async (): Promise<{
  user: { id: string; email?: string };
  profile: Profile | null;
} | null> => {
  return await getCurrentUserRepository();
};

export const logoutService = async (): Promise<void> => {
  return await logoutRepository();
};

export const getUserProfileService = async (
  profileId: string
): Promise<Profile | null> => {
  return await findProfileById(profileId);
};

export const findProfileByEmailService = async (
  email: string
): Promise<Profile | null> => {
  return await findProfileByEmail(email);
};


