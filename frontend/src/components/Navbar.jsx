import { Link, NavLink } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const navItem = ({ isActive }) =>
  `rounded-2xl px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-indigo-600 text-white dark:bg-indigo-400 dark:text-slate-900 shadow-sm"
      : "text-foreground/70 hover:text-foreground hover:bg-card"
  }`;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm dark:bg-indigo-400 dark:text-slate-900">
              📚
            </div>
            <div className="leading-tight">
              <div className="font-extrabold tracking-tight">
                Library Manager
              </div>
              <div className="text-xs text-foreground/60">
                Modern library system
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={navItem}>
              Home
            </NavLink>
            <NavLink to="/about" className={navItem}>
              About
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className="
                inline-flex items-center justify-center rounded-2xl px-4 py-2
                bg-emerald-600 text-white font-semibold shadow-sm
                hover:bg-emerald-700
                dark:bg-emerald-400 dark:text-slate-900 dark:hover:bg-emerald-300
                transition
              "
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
