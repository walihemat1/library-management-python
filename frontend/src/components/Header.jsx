import ThemeToggle from "./ThemeToggle";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../features/auth/authSlice";

export default function Header({ onOpenSidebar }) {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((s) => s.auth);

  const onLogout = async () => {
    await dispatch(logoutUser());
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/75 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSidebar}
              className="md:hidden rounded-xl border border-border bg-card px-3 py-2 text-sm"
              aria-label="Open sidebar"
            >
              ☰
            </button>
            <div className="hidden md:block">
              <p className="font-semibold tracking-tight">Dashboard</p>
              <p className="text-xs text-foreground/60">
                Manage books, users, and checkouts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-border bg-card/70 px-3 py-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white dark:bg-emerald-400 dark:text-slate-900">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">{user?.name || "User"}</p>
                <p className="text-xs text-foreground/60">
                  {user?.role || "member"}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              disabled={isLoading}
              className="
                rounded-2xl px-4 py-2 text-sm font-semibold transition
                bg-indigo-600 text-white hover:bg-indigo-700
                dark:bg-indigo-400 dark:text-slate-900 dark:hover:bg-indigo-300
                disabled:opacity-60
              "
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
