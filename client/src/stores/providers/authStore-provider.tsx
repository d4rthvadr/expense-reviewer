"use client";
import { type AuthStore, createAuthStore } from "@/stores/authStore";
import { createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

export type AuthStoreApi = ReturnType<typeof createAuthStore>;

export const AuthStoreContext = createContext<AuthStoreApi | undefined>(
  undefined
);

export const AuthStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const storeRef = useRef<AuthStoreApi | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createAuthStore();
  }

  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      {children}
    </AuthStoreContext.Provider>
  );
};

export const useAuthStore = <T,>(selector: (store: AuthStore) => T): T => {
  const authStoreContext = useContext(AuthStoreContext);
  if (!authStoreContext) {
    throw new Error("useAuthStore must be used within AuthStoreProvider");
  }
  return useStore(authStoreContext, selector);
};
