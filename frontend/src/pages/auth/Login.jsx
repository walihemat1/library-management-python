import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import ThemeToggle from "../../components/ThemeToggle";
import { loginUser } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const canSubmit = useMemo(() => {
    const e = email.trim();
    return e.includes("@") && password.length >= 4 && !isLoading;
  }, [email, password, isLoading]);

  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return toast.error("Enter a valid email and password.");

    try {
      const auth = await dispatch(
        loginUser({ email: email.trim(), password })
      ).unwrap();

      const role = auth?.role;
      if (role === "admin") navigate("/admin/dashboard", { replace: true });
      else if (role === "librarian")
        navigate("/librarian/dashboard", { replace: true });
      else navigate("/unauthorized", { replace: true }); // or /profile /home
    } catch (err) {
      if (typeof err === "string") toast.error(err);
    }
  };

  return (
    <div className="relative">
      {/* Header row inside container */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm dark:bg-indigo-400 dark:text-slate-900">
            📚
          </div>
          <div className="leading-tight">
            <p className="text-lg font-extrabold tracking-tight">
              Library Manager
            </p>
            <p className="text-xs text-foreground/60">Sign in to continue</p>
          </div>
        </div>

        <ThemeToggle />
      </div>

      {/* Main card section */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Left: feature panel */}
        <section
          className="
            relative overflow-hidden rounded-3xl border border-border
            bg-card/70 backdrop-blur
            p-6 sm:p-8
            shadow-[0_18px_45px_-25px_rgba(15,23,42,0.45)]
          "
        >
          {/* Decorative glow (subtle, not messy) */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/15" />
            <div className="absolute -bottom-28 right-0 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-500/10" />
            <div className="absolute top-1/2 -right-24 h-56 w-56 -translate-y-1/2 rounded-full bg-amber-300/15 blur-3xl dark:bg-amber-500/10" />
          </div>

          <div className="relative">
            <h1 className="text-3xl font-black tracking-tight">
              Welcome back
              <span className="text-indigo-600 dark:text-indigo-300">.</span>
            </h1>
            <p className="mt-2 max-w-md text-sm text-foreground/70">
              A calm, modern workspace to keep your library running smoothly.
            </p>

            <div className="mt-6 grid gap-3">
              <Feature
                title="Find anything in seconds"
                desc="Quick search and filters help you locate books instantly—without the clutter."
              />
              <Feature
                title="Stay organized, effortlessly"
                desc="Clean book records, clear availability, and a smooth day-to-day workflow."
              />
              <Feature
                title="A calm interface that feels premium"
                desc="Designed for focus with readable typography, soft contrast, and smart spacing."
              />
            </div>

            {/* Bottom note (hide on smaller devices) */}
            <div className="mt-6 hidden lg:flex items-center gap-2 rounded-2xl border border-border bg-background/30 px-4 py-3 text-sm text-foreground/70">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Tip: Use{" "}
              <span className="ml-1 rounded-lg border border-border bg-card/60 px-2 py-0.5 text-xs font-semibold">
                Ctrl + K
              </span>{" "}
              to search fast (coming soon).
            </div>
          </div>
        </section>

        {/* Right: login form card */}
        <section
          className="
            rounded-3xl border border-border bg-card/70 backdrop-blur
            p-6 sm:p-8
            shadow-[0_18px_45px_-25px_rgba(15,23,42,0.45)]
          "
        >
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-foreground/65">
              Use your email and password to access your workspace.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Email">
              <div className="relative">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="
                    w-full rounded-2xl border border-border bg-background/40
                    px-4 py-3 pr-10 text-foreground placeholder:text-foreground/40
                    focus:outline-none focus:ring-4
                    focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20
                    transition
                  "
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40">
                  ✉️
                </span>
              </div>
            </Field>

            <Field label="Password">
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="
                    w-full rounded-2xl border border-border bg-background/40
                    px-4 py-3 pr-24 text-foreground placeholder:text-foreground/40
                    focus:outline-none focus:ring-4
                    focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20
                    transition
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    rounded-xl px-3 py-1.5 text-sm font-semibold
                    text-foreground/75 hover:text-foreground
                    hover:bg-card transition
                  "
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-foreground/65">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() =>
                  toast("Please contact support to reset password.")
                }
                className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`
                mt-2 w-full rounded-2xl px-4 py-3 font-semibold transition
                shadow-sm
                ${
                  canSubmit
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-400 dark:hover:bg-indigo-300 dark:text-slate-900"
                    : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed"
                }
                focus:outline-none focus:ring-4
                focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20
              `}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            <div className="mt-5 rounded-2xl border border-border bg-background/30 p-4 text-sm text-foreground/70">
              Need access?{" "}
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                Contact your library staff
              </span>{" "}
              to get an account.
            </div>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs text-foreground/55">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Secure sign-in
            </span>
            <span className="hidden sm:inline">
              © {new Date().getFullYear()} Library Manager
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-foreground/80">
        {label}
      </label>
      {children}
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="rounded-2xl border border-border bg-background/25 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white dark:bg-emerald-400 dark:text-slate-900">
          ✓
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm text-foreground/65">{desc}</p>
        </div>
      </div>
    </div>
  );
}
