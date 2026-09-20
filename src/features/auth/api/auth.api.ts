import {
  SignUpRequest,
  SignUpResponse,
  LoginRequest,
  LoginResponse,
} from "../auth.type";
import { Profile } from "@/types/Profile";

export async function requestSignUp(
  data: SignUpRequest
): Promise<SignUpResponse> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData?.error || "Failed to sign up");
  }

  return responseData;
}

export async function requestLogin(
  data: LoginRequest
): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData?.error || "Failed to login");
  }

  return responseData;
}

export async function requestGoogleLogin(): Promise<string> {
  const response = await fetch("/api/auth/google", {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || "Failed to initialize Google login");
  }

  const data = await response.json();
  return data.url;
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  if (!userId) return null;

  const response = await fetch(
    `/api/auth/profile?userId=${encodeURIComponent(userId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || "Failed to fetch user profile");
  }

  return await response.json();
}

export async function getCurrentUser(): Promise<{
  user: { id: string; email?: string };
  profile: Profile | null;
} | null> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

export async function requestLogout(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || "Failed to logout");
  }
}






