import { create } from "zustand";

interface AuthModalState {
  isOpen: boolean;
  title: string;
  description: string;
  openModal: (options?: { title?: string; description?: string }) => void;
  closeModal: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  title: "Sign in to use Watchlist",
  description:
    "Save movies and TV shows to your personal watchlist to watch anytime and sync across all your devices.",
  openModal: (options) =>
    set({
      isOpen: true,
      title: options?.title || "Sign in to use Watchlist",
      description:
        options?.description ||
        "Save movies and TV shows to your personal watchlist to watch anytime and sync across all your devices.",
    }),
  closeModal: () => set({ isOpen: false }),
}));
