import { create } from "zustand";

export type AuthMode = "login" | "signup";

interface AuthState {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  toggleMode: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  mode: "login",
  setMode: (mode) => set({ mode }),
  toggleMode: () =>
    set((state) => ({ mode: state.mode === "login" ? "signup" : "login" })),
}));
