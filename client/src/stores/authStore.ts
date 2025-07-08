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

type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthActions = {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
};

export type AuthStore = AuthState & AuthActions;

export const defaultAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

export const createAuthStore = (initialState: AuthState = defaultAuthState) => {
  return createStore<AuthStore>()((set) => ({
    ...initialState,
    login: async (_credentials) => {
      // default no-op implementation
      return;
    },
    logout: () => {
      // default no-op implementation
      return;
    },
    checkAuth: async () => {
      // default no-op implementation
      return;
    },
  }));
};
