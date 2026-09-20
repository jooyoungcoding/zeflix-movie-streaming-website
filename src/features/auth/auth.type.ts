import { Profile } from "@/types/Profile";

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
}

export interface SignUpResponse {
  user: {
    id: string;
    email?: string;
  } | null;
  profile: Profile | null;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email?: string;
  } | null;
  profile: Profile | null;
  message: string;
  session?: {
    access_token: string;
    refresh_token: string;
  } | null;
}

