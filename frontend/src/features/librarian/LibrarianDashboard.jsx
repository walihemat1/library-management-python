import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  fetchBooks,
  checkoutBookById,
  returnBookByEntry,
} from "../books/booksSlice";
import { fetchUserHistory } from "../history/historySlice";

export default function LibrarianDashboardPage() {
  const dispatch = useDispatch();

  const { items: books = [], isLoading: booksLoading } = useSelector(
    (s) => s.books
  );
  const {
    userItems: history = [],
    isLoading: historyLoading,
    error,
  } = useSelector((s) => s.history);
  const { user } = useSelector((s) => s.auth);

  const myUserId = user?.id;

  const [q, setQ] = useState("");

  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  useEffect(() => {
    if (!myUserId) return;
    dispatch(fetchUserHistory(myUserId));
  }, [dispatch, myUserId]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const stats = useMemo(() => {
    const total = books.length;
    const available = books.filter((b) => Number(b.available) === 1).length;
    const checkedOut = total - available;

    const myActive = history.filter((h) => !h.return_date).length;
    const myReturned = history.length - myActive;

    return { total, available, checkedOut, myActive, myReturned };
  }, [books, history]);

  const myActiveItems = useMemo(() => {
    return history
      .filter((h) => !h.return_date)
      .sort(
        (a, b) =>
          new Date(b.checkout_date).getTime() -
          new Date(a.checkout_date).getTime()
      );
  }, [history]);

  const recentActivity = useMemo(() => {
    return [...history]
      .sort((a, b) => {
        const ad = new Date(a.return_date || a.checkout_date).getTime();
        const bd = new Date(b.return_date || b.checkout_date).getTime();
        return bd - ad;
      })
      .slice(0, 6);
  }, [history]);

  const suggestedBooks = useMemo(() => {
    const query = q.trim().toLowerCase();
    const avail = books.filter((b) => Number(b.available) === 1);

    const filtered = !query
      ? avail
      : avail.filter((b) => {
          const hay = `${b.title || ""} ${b.author || ""} ${b.language || ""} ${
            b.year || ""
          }`.toLowerCase();
          return hay.includes(query);
        });

    return filtered.slice(0, 6);
  }, [books, q]);

  const busy = booksLoading || historyLoading;

  const onRefresh = () => {
    dispatch(fetchBooks());
    if (myUserId) dispatch(fetchUserHistory(myUserId));
  };

  const onCheckout = async (bookId) => {
    try {
      await dispatch(checkoutBookById(bookId)).unwrap();
      dispatch(fetchBooks());
      if (myUserId) dispatch(fetchUserHistory(myUserId));
    } catch (_) {}
  };

  const onReturn = async (entryId, bookId) => {
    try {
      await dispatch(returnBookByEntry({ entryId, bookId })).unwrap();
      dispatch(fetchBooks());
      if (myUserId) dispatch(fetchUserHistory(myUserId));
    } catch (_) {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Welcome{user?.name ? `, ${user.name}` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-foreground/65">
            Browse books, manage your checkouts, and track your activity.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            onClick={onRefresh}
            className="rounded-2xl border border-border bg-card/60 px-4 py-2 font-semibold hover:bg-card/80 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total books" value={stats.total} />
        <StatCard
          title="Available now"
          value={stats.available}
          accent="emerald"
        />
        <StatCard title="Checked out" value={stats.checkedOut} accent="amber" />
        <StatCard
          title="My active borrows"
          value={stats.myActive}
          accent="indigo"
        />
        <StatCard title="My returned" value={stats.myReturned} accent="slate" />
      </div>

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Find a book</h2>
                <p className="text-sm text-foreground/65">
                  Search available books and check out instantly.
                </p>
              </div>
              <div className="text-xs text-foreground/60">
                {busy ? "Loading…" : `${stats.available} available`}
              </div>
            </div>

            <div className="mt-4">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, author, language, year…"
                className="w-full rounded-2xl border border-border bg-background/40 px-4 py-3
                           focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {busy && (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              )}

              {!busy && suggestedBooks.length === 0 && (
                <div className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-border bg-background/30 p-4">
                  <p className="font-semibold">No matches</p>
                  <p className="text-sm text-foreground/60">
                    Try a different keyword.
                  </p>
                </div>
              )}

              {!busy &&
                suggestedBooks.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-3xl border border-border bg-background/30 p-4 hover:bg-background/40 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold leading-snug">{b.title}</p>
                        <p className="mt-1 text-sm text-foreground/70">
                          {b.author}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-foreground/70">
                          <Tag label={b.language || "—"} />
                          <Tag label={b.year || "—"} />
                          <Tag label={`#${b.id}`} />
                        </div>
                      </div>

                      <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        Available
                      </span>
                    </div>

                    <button
                      onClick={() => onCheckout(b.id)}
                      className="mt-4 w-full rounded-2xl bg-indigo-600 px-4 py-2.5 font-semibold text-white
                                 hover:bg-indigo-700 dark:bg-indigo-400 dark:text-slate-900 dark:hover:bg-indigo-300 transition"
                    >
                      Check out
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-3xl border border-border bg-card/60 backdrop-blur overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Recent activity</h2>
                <p className="text-sm text-foreground/65">
                  Your latest borrow/return actions.
                </p>
              </div>
            </div>

            <div className="divide-y divide-border">
              {busy && (
                <div className="px-5 py-6 text-sm text-foreground/70">
                  Loading activity…
                </div>
              )}

              {!busy && recentActivity.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="text-lg font-semibold">No activity yet</p>
                  <p className="mt-1 text-sm text-foreground/60">
                    Check out your first book to see activity here.
                  </p>
                </div>
              )}

              {!busy &&
                recentActivity.map((h) => {
                  const active = !h.return_date;
                  return (
                    <div key={h.id} className="px-5 py-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold">{h.title || "—"}</p>
                          <p className="text-xs text-foreground/60">
                            Entry #{h.id} • Book #{h.book_id}
                          </p>
                          <p className="mt-1 text-sm text-foreground/70">
                            {active ? "Checked out" : "Returned"}{" "}
                            <span className="font-semibold text-foreground">
                              {fmtDate(h.return_date || h.checkout_date)}
                            </span>
                          </p>
                        </div>

                        <StatusPill active={active} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right: My active checkouts */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-border bg-card/60 backdrop-blur overflow-hidden">
            <div className="px-5 py-4">
              <h2 className="text-lg font-extrabold">My active checkouts</h2>
              <p className="text-sm text-foreground/65">
                Return books you currently have.
              </p>
            </div>

            <div className="divide-y divide-border">
              {busy && (
                <div className="px-5 py-6 text-sm text-foreground/70">
                  Loading active checkouts…
                </div>
              )}

              {!busy && myActiveItems.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="text-lg font-semibold">All clear ✅</p>
                  <p className="mt-1 text-sm text-foreground/60">
                    You have no active borrowed books.
                  </p>
                </div>
              )}

              {!busy &&
                myActiveItems.map((h) => (
                  <div key={h.id} className="px-5 py-4">
                    <p className="font-semibold">{h.title || "—"}</p>
                    <p className="text-xs text-foreground/60">
                      Entry #{h.id} • Book #{h.book_id}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="text-sm text-foreground/70">
                        Checked out:{" "}
                        <span className="font-semibold text-foreground">
                          {fmtDate(h.checkout_date)}
                        </span>
                      </div>

                      <button
                        onClick={() => onReturn(h.id, h.book_id)}
                        className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white
                                   hover:bg-emerald-700 dark:bg-emerald-400 dark:text-slate-900 dark:hover:bg-emerald-300 transition"
                      >
                        Return
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Tiny tip card */}
          <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-5">
            <p className="text-sm font-semibold">Tip</p>
            <p className="mt-1 text-sm text-foreground/65">
              Use the search box to filter available books by title, author,
              language, or year.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== UI helpers ===================== */

function StatCard({ title, value, accent = "indigo" }) {
  const accentCls =
    accent === "emerald"
      ? "from-emerald-500/15 to-emerald-500/5 border-emerald-400/20"
      : accent === "amber"
      ? "from-amber-500/15 to-amber-500/5 border-amber-400/20"
      : accent === "slate"
      ? "from-slate-500/15 to-slate-500/5 border-slate-400/20"
      : "from-indigo-500/15 to-indigo-500/5 border-indigo-400/20";

  return (
    <div
      className={`rounded-3xl border ${accentCls} bg-gradient-to-b bg-card/60 backdrop-blur p-5`}
    >
      <p className="text-xs font-semibold text-foreground/60">{title}</p>
      <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
    </div>
  );
}

function StatusPill({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold
        ${
          active
            ? "border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
            : "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          active ? "bg-amber-500" : "bg-emerald-500"
        }`}
      />
      {active ? "Active" : "Returned"}
    </span>
  );
}

function Tag({ label }) {
  return (
    <span className="rounded-full border border-border bg-background/30 px-3 py-1">
      {label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-border bg-background/20 p-4">
      <div className="h-4 w-2/3 rounded bg-foreground/10" />
      <div className="mt-2 h-3 w-1/2 rounded bg-foreground/10" />
      <div className="mt-4 h-9 w-full rounded-2xl bg-foreground/10" />
    </div>
  );
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
