export type Theme = "light" | "dark" | "grey";

export const THEME_STORAGE_KEY = "market-analyzer-theme";

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "grey");
  if (theme === "dark") root.classList.add("dark");
  else if (theme === "grey") root.classList.add("grey");
}

export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "dark" || v === "grey" || v === "light") return v;
  } catch {
    /* ignore */
  }
  return "dark";
}
