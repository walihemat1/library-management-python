import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminCreateUser,
  adminUpdateUserRole,
  adminUpdateUserStatus,
  fetchAdminUsers,
  // OPTIONAL: implement this thunk if you add backend endpoint
  adminResetUserPassword,
} from "./AdminUsersSlice";
import toast from "react-hot-toast";

const ROLES = ["admin", "librarian", "member"];
const PAGE_SIZES = [10, 20, 50];

export default function AdminUsersPage() {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((s) => s.adminUsers);
  const { user: me } = useSelector((s) => s.auth);

  const myId = me?.id;

  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // pagination
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // deactivate confirm
  const [confirm, setConfirm] = useState({ open: false, target: null });

  // reset password modal
  const [reset, setReset] = useState({ open: false, target: null });

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (users || []).filter((u) => {
      const active = Number(u.is_active ?? 1) === 1;
      if (onlyActive && !active) return false;
      if (!query) return true;
      const hay = `${u.name || ""} ${u.email || ""} ${
        u.role || ""
      }`.toLowerCase();
      return hay.includes(query);
    });
  }, [users, q, onlyActive]);

  // keep page valid when filters change
  useEffect(() => {
    setPage(1);
  }, [q, onlyActive, pageSize]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const canDeactivate = (u) => {
    if (!myId) return true;
    return u.id !== myId;
  };

  const onToggleActive = async (u) => {
    const currentlyActive = Number(u.is_active ?? 1) === 1;

    // prevent self-deactivate
    if (currentlyActive && !canDeactivate(u)) {
      toast.error("You can’t deactivate your own account.");
      return;
    }

    if (currentlyActive) {
      // open confirm modal for deactivation
      setConfirm({ open: true, target: u });
      return;
    }

    // activation does not require confirm
    await dispatch(
      adminUpdateUserStatus({ userId: u.id, is_active: true })
    ).unwrap();
  };

  const confirmDeactivate = async () => {
    const u = confirm.target;
    if (!u) return;

    try {
      await dispatch(
        adminUpdateUserStatus({ userId: u.id, is_active: false })
      ).unwrap();
      setConfirm({ open: false, target: null });
    } catch (e) {
      setConfirm({ open: false, target: null });
    }
  };

  const onRoleChange = async (u, role) => {
    if (!ROLES.includes(role)) return toast.error("Invalid role");
    await dispatch(adminUpdateUserRole({ userId: u.id, role })).unwrap();
  };

  const openResetPassword = (u) => {
    setReset({ open: true, target: u });
  };

  const submitResetPassword = async (newPassword) => {
    const u = reset.target;
    if (!u) return;

    if (!newPassword || newPassword.length < 4) {
      toast.error("Password must be at least 4 characters.");
      return;
    }

    // For now (until backend exists):
    await dispatch(
      adminResetUserPassword({ userId: u.id, password: newPassword })
    ).unwrap();
    setReset({ open: false, target: null });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-foreground/65">
            Create accounts, set roles, and activate or deactivate access.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            onClick={() => dispatch(fetchAdminUsers())}
            className="rounded-2xl border border-border bg-card/60 px-4 py-2 font-semibold hover:bg-card/80 transition"
          >
            Refresh
          </button>

          <button
            onClick={() => setCreateOpen(true)}
            className="rounded-2xl bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-400 dark:text-slate-900 dark:hover:bg-emerald-300 transition"
          >
            + Create User
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, email, role..."
              className="w-full md:max-w-md rounded-2xl border border-border bg-background/40 px-4 py-3
                         focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
            />

            <label className="inline-flex items-center gap-2 text-sm text-foreground/70">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(e) => setOnlyActive(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Active only
            </label>
          </div>

          {/* Pagination controls */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="text-xs text-foreground/60">
              {filtered.length} users
            </div>

            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="
                rounded-2xl border border-border bg-background/40 px-3 py-2 text-sm font-semibold
                text-foreground
                focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20
              "
            >
              {PAGE_SIZES.map((n) => (
                <option
                  key={n}
                  value={n}
                  className="bg-background text-foreground"
                >
                  {n}/page
                </option>
              ))}
            </select>

            <Pager page={page} setPage={setPage} pageCount={pageCount} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-border bg-card/60 backdrop-blur overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-4 text-xs font-semibold text-foreground/60">
          <div className="col-span-3">User</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-border">
          {isLoading && (
            <div className="px-5 py-6 text-sm text-foreground/70">
              Loading users...
            </div>
          )}

          {!isLoading && paged.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-lg font-semibold">No users found</p>
              <p className="mt-1 text-sm text-foreground/60">
                Try a different search or clear filters.
              </p>
            </div>
          )}

          {paged.map((u) => {
            const active = Number(u.is_active ?? 1) === 1;
            const isMe = myId && u.id === myId;

            return (
              <div key={u.id} className="px-5 py-4">
                {/* Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-3">
                    <p className="font-semibold">
                      {u.name}{" "}
                      {isMe && (
                        <span className="ml-2 rounded-full border border-border bg-background/30 px-2 py-0.5 text-[10px] font-bold text-foreground/70">
                          YOU
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-foreground/60">#{u.id}</p>
                  </div>

                  <div className="col-span-3 text-foreground/80">{u.email}</div>

                  <div className="col-span-2">
                    {/* ✅ Fix dark-mode option text by forcing text + bg for select/option */}
                    <select
                      value={u.role}
                      onChange={(e) => onRoleChange(u, e.target.value)}
                      className="
                        w-full rounded-2xl border border-border bg-background/40 px-3 py-2 text-sm font-semibold
                        text-foreground
                        focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20
                      "
                    >
                      {ROLES.map((r) => (
                        <option
                          key={r}
                          value={r}
                          className="bg-background text-foreground"
                        >
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <StatusPill active={active} />
                  </div>

                  <div className="col-span-2 flex justify-end gap-2">
                    <button
                      onClick={() => openResetPassword(u)}
                      className="rounded-xl border border-border bg-background/30 px-3 py-2 text-sm font-semibold hover:bg-background/50 transition"
                    >
                      Reset password
                    </button>

                    <button
                      onClick={() => onToggleActive(u)}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold transition
                        ${
                          active
                            ? "bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-400 dark:text-slate-900 dark:hover:bg-amber-300"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-400 dark:text-slate-900 dark:hover:bg-emerald-300"
                        }`}
                      title={
                        active && !canDeactivate(u)
                          ? "You can't deactivate yourself"
                          : ""
                      }
                      disabled={active && !canDeactivate(u)}
                    >
                      {active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>

                {/* Mobile */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold">
                        {u.name}{" "}
                        {isMe && (
                          <span className="ml-2 rounded-full border border-border bg-background/30 px-2 py-0.5 text-[10px] font-bold text-foreground/70">
                            YOU
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-foreground/70">{u.email}</p>
                      <p className="text-xs text-foreground/60">#{u.id}</p>
                    </div>
                    <StatusPill active={active} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={u.role}
                      onChange={(e) => onRoleChange(u, e.target.value)}
                      className="
    w-full rounded-2xl border border-border
    bg-background px-3 py-2 text-sm font-semibold
    text-slate-900 dark:text-slate-100
    appearance-none
    focus:outline-none focus:ring-4
    focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20
    dark:[&>option]:bg-slate-800
    dark:[&>option]:text-slate-100
  "
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => onToggleActive(u)}
                      className={`rounded-2xl px-3 py-2 text-sm font-semibold transition
                        ${
                          active
                            ? "bg-amber-600 text-white dark:bg-amber-400 dark:text-slate-900"
                            : "bg-emerald-600 text-white dark:bg-emerald-400 dark:text-slate-900"
                        }`}
                      disabled={active && !canDeactivate(u)}
                    >
                      {active ? "Deactivate" : "Activate"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openResetPassword(u)}
                      className="rounded-2xl border border-border bg-background/30 px-3 py-2 text-sm font-semibold"
                    >
                      Reset password
                    </button>

                    <button
                      onClick={() => toast("More actions coming...")}
                      className="rounded-2xl border border-border bg-background/30 px-3 py-2 text-sm font-semibold"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer pager (nice UX) */}
        <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-foreground/60">
            Page <span className="font-semibold text-foreground">{page}</span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">{pageCount}</span>
          </div>
          <Pager page={page} setPage={setPage} pageCount={pageCount} />
        </div>
      </div>

      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={async (payload) => {
          await dispatch(adminCreateUser(payload)).unwrap();
          setCreateOpen(false);
        }}
        isLoading={isLoading}
      />

      <ConfirmModal
        open={confirm.open}
        title="Deactivate account?"
        desc={
          confirm.target
            ? `This will block ${confirm.target.name} from logging in and using the system.`
            : ""
        }
        confirmText="Deactivate"
        onClose={() => setConfirm({ open: false, target: null })}
        onConfirm={confirmDeactivate}
        tone="danger"
      />

      <ResetPasswordModal
        open={reset.open}
        user={reset.target}
        onClose={() => setReset({ open: false, target: null })}
        onConfirm={submitResetPassword}
      />
    </div>
  );
}

function StatusPill({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold
        ${
          active
            ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "border-slate-400/40 bg-slate-500/10 text-slate-700 dark:text-slate-300"
        }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function Pager({ page, setPage, pageCount }) {
  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => canPrev && setPage(1)}
        disabled={!canPrev}
        className="rounded-xl border border-border bg-background/30 px-3 py-2 text-sm font-semibold disabled:opacity-50"
      >
        First
      </button>
      <button
        onClick={() => canPrev && setPage(page - 1)}
        disabled={!canPrev}
        className="rounded-xl border border-border bg-background/30 px-3 py-2 text-sm font-semibold disabled:opacity-50"
      >
        Prev
      </button>
      <button
        onClick={() => canNext && setPage(page + 1)}
        disabled={!canNext}
        className="rounded-xl border border-border bg-background/30 px-3 py-2 text-sm font-semibold disabled:opacity-50"
      >
        Next
      </button>
      <button
        onClick={() => canNext && setPage(pageCount)}
        disabled={!canNext}
        className="rounded-xl border border-border bg-background/30 px-3 py-2 text-sm font-semibold disabled:opacity-50"
      >
        Last
      </button>
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  desc,
  confirmText,
  onClose,
  onConfirm,
  tone = "default",
}) {
  if (!open) return null;

  const confirmCls =
    tone === "danger"
      ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-slate-900"
      : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-400 dark:hover:bg-indigo-300 text-white dark:text-slate-900";

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card/85 backdrop-blur p-6 shadow-[0_18px_45px_-25px_rgba(15,23,42,0.55)]">
          <h3 className="text-lg font-extrabold">{title}</h3>
          <p className="mt-2 text-sm text-foreground/70">{desc}</p>

          <div className="mt-5 flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="rounded-2xl border border-border bg-background/30 px-4 py-2 font-semibold hover:bg-background/50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`rounded-2xl px-4 py-2 font-semibold transition ${confirmCls}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordModal({ open, user, onClose, onConfirm }) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) setPw("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card/85 backdrop-blur p-6 shadow-[0_18px_45px_-25px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold">Reset password</h3>
              <p className="mt-1 text-sm text-foreground/70">
                Set a new password for{" "}
                <span className="font-semibold text-foreground">
                  {user?.name || "user"}
                </span>
                .
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-2xl border border-border bg-background/30 px-3 py-2 text-sm font-semibold hover:bg-background/50 transition"
            >
              Close
            </button>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-semibold text-foreground/80">
              New password
            </label>
            <div className="relative">
              <input
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                type={show ? "text" : "password"}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-border bg-background/40 px-4 py-3 pr-24
                           focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-3 py-1.5 text-sm font-semibold
                           text-foreground/75 hover:text-foreground hover:bg-background/30 transition"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
            <p className="mt-2 text-xs text-foreground/60">
              Tip: use at least 8 characters for better security.
            </p>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-2xl border border-border bg-background/30 px-4 py-2 font-semibold hover:bg-background/50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(pw)}
              className="rounded-2xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700
                         dark:bg-indigo-400 dark:text-slate-900 dark:hover:bg-indigo-300 transition"
            >
              Update password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateUserModal({ open, onClose, onCreate, isLoading }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("member");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error("Please fill all fields.");
      return;
    }
    await onCreate({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
    });
    reset();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-card/80 backdrop-blur p-6 shadow-[0_18px_45px_-25px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">
                Create user
              </h2>
              <p className="mt-1 text-sm text-foreground/65">
                Add a new account and assign a role.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-2xl border border-border bg-background/30 px-3 py-2 text-sm font-semibold hover:bg-background/50 transition"
            >
              Close
            </button>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <Field label="Full name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amina Rahimi"
                className="w-full rounded-2xl border border-border bg-background/40 px-4 py-3
                           focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
              />
            </Field>

            <Field label="Email">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@example.com"
                type="email"
                className="w-full rounded-2xl border border-border bg-background/40 px-4 py-3
                           focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
              />
            </Field>

            <Field label="Password">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set a password"
                type="password"
                className="w-full rounded-2xl border border-border bg-background/40 px-4 py-3
                           focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
              />
            </Field>

            <Field label="Role">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="
                  w-full rounded-2xl border border-border bg-background/40 px-4 py-3 font-semibold
                  text-foreground
                  focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20
                "
              >
                {ROLES.map((r) => (
                  <option
                    key={r}
                    value={r}
                    className="bg-background text-foreground"
                  >
                    {r}
                  </option>
                ))}
              </select>
            </Field>

            <button
              disabled={isLoading}
              className="w-full rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm
                         hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed
                         dark:bg-indigo-400 dark:text-slate-900 dark:hover:bg-indigo-300 transition"
            >
              {isLoading ? "Creating..." : "Create user"}
            </button>
          </form>
        </div>
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
