import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return (
      window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false
    );
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark((p) => !p)}
      className="
        inline-flex items-center gap-2 rounded-xl px-3 py-2
        border border-border bg-card/70 backdrop-blur
        text-foreground/80 hover:text-foreground
        hover:bg-card transition shadow-sm
      "
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <span className="text-lg">{isDark ? "🌙" : "☀️"}</span>
      <span className="hidden sm:inline text-sm font-medium">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}
