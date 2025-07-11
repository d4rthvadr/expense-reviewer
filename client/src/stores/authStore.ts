import { createStore } from "zustand/vanilla";

type User = {
  id: string;
  email: string;
};
export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type AuthStore = AuthState;

export const defaultAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

export const createAuthStore = (initialState: AuthState = defaultAuthState) => {
  return createStore<AuthStore>()(() => ({
    ...initialState,
  }));
};
