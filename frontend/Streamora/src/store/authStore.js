import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      status: "idle", // idle | loading | authenticated | unauthenticated
      error: null,
      isInitialized: false,

      // Computed helpers
      isAuthenticated: () => get().status === "authenticated" && !!get().user,
      isLoading: () => get().status === "loading",

      // Actions
      setLoading: () => set({ status: "loading", error: null }),

      setUser: (user, accessToken) => {
        localStorage.setItem("access_token", accessToken);
        set({ user, accessToken, status: "authenticated", error: null, isInitialized: true });
      },

      updateUser: (userData) => {
        const updated = { ...get().user, ...userData };
        localStorage.setItem("user", JSON.stringify(updated));
        set({ user: updated });
      },

      setAccessToken: (accessToken) => {
        localStorage.setItem("access_token", accessToken);
        set({ accessToken });
      },

      setError: (error) => set({
        error: error?.message || error,
        status: get().user ? "authenticated" : "unauthenticated",
      }),

      clearError: () => set({ error: null }),

      logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        set({ user: null, accessToken: null, status: "unauthenticated", error: null, isInitialized: true });
      },

      setInitialized: () => set({
        isInitialized: true,
        status: get().status === "idle" ? "unauthenticated" : get().status,
      }),
    }),
    {
      name: "streamora-auth",
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
);

export default useAuthStore;
 
