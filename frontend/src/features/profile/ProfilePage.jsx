import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeMyPassword, updateMyProfile } from "./profileSlice";
import toast from "react-hot-toast";
import { fetchMe, updateAuthUser } from "../auth/authSlice";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((s) => s.profile);
  const { user } = useSelector((s) => s.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user]);

  const onSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return toast.error("Fill all fields.");

    try {
      const user = await dispatch(
        updateMyProfile({ name: name.trim(), email: email.trim() })
      ).unwrap();
      dispatch(updateAuthUser(user));
    } catch (_) {}
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPw || !newPw) return toast.error("Fill all fields.");
    if (newPw.length < 4) return toast.error("Password too short.");

    try {
      await dispatch(
        changeMyPassword({
          current_password: currentPw,
          new_password: newPw,
        })
      ).unwrap();

      setCurrentPw("");
      setNewPw("");
    } catch (_) {}
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">My Profile</h1>
        <p className="mt-1 text-sm text-foreground/65">
          Update your info and change your password.
        </p>
      </div>

      {/* Profile */}
      <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-6">
        <h2 className="text-lg font-extrabold">Profile info</h2>

        <form onSubmit={onSaveProfile} className="mt-4 space-y-4">
          <Field label="Full name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background/40 px-4 py-3
                         focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
            />
          </Field>

          <Field label="Email">
            <input
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background/40 px-4 py-3
                         focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
            />
          </Field>

          <button
            disabled={isLoading}
            className="rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white
                       hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed
                       dark:bg-indigo-400 dark:text-slate-900 dark:hover:bg-indigo-300 transition"
          >
            {isLoading ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-6">
        <h2 className="text-lg font-extrabold">Change password</h2>

        <form onSubmit={onChangePassword} className="mt-4 space-y-4">
          <Field label="Current password">
            <input
              value={currentPw}
              type={showPw ? "text" : "password"}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background/40 px-4 py-3
                         focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
            />
          </Field>

          <Field label="New password">
            <input
              value={newPw}
              type={showPw ? "text" : "password"}
              onChange={(e) => setNewPw(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background/40 px-4 py-3
                         focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
            />
          </Field>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="rounded-2xl border border-border bg-background/30 px-4 py-2 font-semibold hover:bg-background/50 transition"
            >
              {showPw ? "Hide" : "Show"} passwords
            </button>

            <button
              disabled={isLoading}
              className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white
                         hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed
                         dark:bg-emerald-400 dark:text-slate-900 dark:hover:bg-emerald-300 transition"
            >
              {isLoading ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
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
