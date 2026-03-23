import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("LangChat-theme") || "winter",
  setTheme: (theme) => {
    localStorage.setItem("LangChat-theme", theme);
    set({ theme });
  },
}));
