import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthStore = {
  user_id: string | null;
  profile_id: string | null;
  avatar_url: string | null;
  username: string | null;
  display_name: string | null;
  email: string | null;

  setAuth: (data: {
    user_id: string;
    profile_id?: string | null;
    avatar_url?: string | null;
    username?: string | null;
    display_name?: string | null;
    email?: string | null;
  }) => void;

  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user_id: null,
      profile_id: null,
      avatar_url: null,
      username: null,
      display_name: null,
      email: null,

      setAuth: ({ user_id, profile_id, avatar_url, username, display_name, email }) =>
        set((state) => ({
          user_id,
          profile_id: profile_id ?? user_id,
          avatar_url: avatar_url !== undefined ? avatar_url : state.avatar_url,
          username: username !== undefined ? username : state.username,
          display_name: display_name !== undefined ? display_name : state.display_name,
          email: email !== undefined ? email : state.email,
        })),

      clearAuth: () =>
        set({
          user_id: null,
          profile_id: null,
          avatar_url: null,
          username: null,
          display_name: null,
          email: null,
        }),
    }),
    {
      name: "zeflix-auth-store",
    }
  )
);
