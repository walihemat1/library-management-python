import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchUserHistory,
  fetchBookHistory,
  fetchAllHistory,
} from "./historySlice";
import { returnBookByEntry } from "../books/booksSlice";

export default function HistoryPage() {
  const dispatch = useDispatch();

  const {
    userItems,
    bookItems,
    adminItems,
    isLoading,
    error,
    viewingUserId,
    viewingBookId,
  } = useSelector((s) => s.history);

  const { user, role } = useSelector((s) => s.auth);

  const isAdmin = role === "admin";
  const myUserId = user?.id;

  const [tab, setTab] = useState(isAdmin ? "all" : "user");

  // filters/search
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // admin inputs
  const [adminUserId, setAdminUserId] = useState("");
  const [adminBookId, setAdminBookId] = useState("");

  useEffect(() => {
    if (!myUserId) return;
    dispatch(fetchUserHistory(myUserId));
  }, [dispatch, myUserId]);

  useEffect(() => {
    if (isAdmin) dispatch(fetchAllHistory());
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const onReturn = async (h) => {
    if (!h?.id || !h?.book_id) return toast.error("Invalid history entry.");
    try {
      await dispatch(
        returnBookByEntry({ entryId: h.id, bookId: h.book_id })
      ).unwrap();

      // refresh current view
      if (tab === "user") {
        const uid = viewingUserId || myUserId;
        if (uid) dispatch(fetchUserHistory(uid));
      } else if (tab === "book") {
        if (viewingBookId) dispatch(fetchBookHistory(viewingBookId));
      } else if (tab === "all") {
        dispatch(fetchAllHistory());
      }
    } catch (_) {}
  };

  const currentItems = useMemo(() => {
    if (tab === "user") return userItems || [];
    if (tab === "book") return bookItems || [];
    return adminItems || [];
  }, [tab, userItems, bookItems, adminItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return currentItems.filter((x) => {
      const isActive = !x.return_date;
      if (filter === "active" && !isActive) return false;
      if (filter === "returned" && isActive) return false;

      if (!q) return true;

      // normalize fields across tabs
      const bookTitle = x.book_title || x.title || "";
      const userName = x.user_name || "";
      const email = x.email || "";

      const hay = `${bookTitle} ${userName} ${email} ${x.checkout_date || ""} ${
        x.return_date || ""
      } #${x.book_id || ""} #${x.user_id || ""} #${x.id || ""}`.toLowerCase();

      return hay.includes(q);
    });
  }, [currentItems, search, filter]);

  const onAdminLoadUser = () => {
    const id = Number(adminUserId);
    if (!id || id <= 0) return toast.error("Enter a valid user id.");
    dispatch(fetchUserHistory(id));
    setTab("user");
  };

  const onAdminLoadBook = () => {
    const id = Number(adminBookId);
    if (!id || id <= 0) return toast.error("Enter a valid book id.");
    dispatch(fetchBookHistory(id));
    setTab("book");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Checkout History
          </h1>
          <p className="mt-1 text-sm text-foreground/65">
            Track who borrowed what, and return status.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              if (tab === "all" && isAdmin) dispatch(fetchAllHistory());
              else if (tab === "book" && isAdmin && viewingBookId)
                dispatch(fetchBookHistory(viewingBookId));
              else if (tab === "user" && (viewingUserId || myUserId))
                dispatch(fetchUserHistory(viewingUserId || myUserId));
            }}
            className="rounded-2xl border border-border bg-card/60 px-4 py-2 font-semibold hover:bg-card/80 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Admin tabs */}
      {isAdmin && (
        <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Admin history tools</p>
              <p className="text-xs text-foreground/60">
                All history shows who borrowed which book (required).
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <TabButton
                active={tab === "all"}
                onClick={() => setTab("all")}
                label="All history"
              />
              <TabButton
                active={tab === "user"}
                onClick={() => setTab("user")}
                label="By user"
              />
              <TabButton
                active={tab === "book"}
                onClick={() => setTab("book")}
                label="By book"
              />
            </div>
          </div>

          {/* quick loaders */}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="flex gap-2">
              <input
                value={adminUserId}
                onChange={(e) => setAdminUserId(e.target.value)}
                placeholder="User ID"
                className="w-full rounded-2xl border border-border bg-background/40 px-4 py-2.5
                           focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
              />
              <button
                onClick={onAdminLoadUser}
                className="rounded-2xl bg-indigo-600 px-4 py-2.5 font-semibold text-white
                           hover:bg-indigo-700 dark:bg-indigo-400 dark:text-slate-900 dark:hover:bg-indigo-300 transition"
              >
                Load user
              </button>
            </div>

            <div className="flex gap-2">
              <input
                value={adminBookId}
                onChange={(e) => setAdminBookId(e.target.value)}
                placeholder="Book ID"
                className="w-full rounded-2xl border border-border bg-background/40 px-4 py-2.5
                           focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
              />
              <button
                onClick={onAdminLoadBook}
                className="rounded-2xl bg-indigo-600 px-4 py-2.5 font-semibold text-white
                           hover:bg-indigo-700 dark:bg-indigo-400 dark:text-slate-900 dark:hover:bg-indigo-300 transition"
              >
                Load book
              </button>
            </div>
          </div>

          {tab === "user" && viewingUserId && (
            <p className="mt-3 text-xs text-foreground/60">
              Viewing user:{" "}
              <span className="font-semibold text-foreground">
                #{viewingUserId}
              </span>
            </p>
          )}
          {tab === "book" && viewingBookId && (
            <p className="mt-3 text-xs text-foreground/60">
              Viewing book:{" "}
              <span className="font-semibold text-foreground">
                #{viewingBookId}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by book, user, email, dates..."
            className="w-full md:max-w-md rounded-2xl border border-border bg-background/40 px-4 py-3
                       focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
          />

          <div className="flex gap-2">
            <FilterPill
              active={filter === "all"}
              onClick={() => setFilter("all")}
              label="All"
            />
            <FilterPill
              active={filter === "active"}
              onClick={() => setFilter("active")}
              label="Active"
            />
            <FilterPill
              active={filter === "returned"}
              onClick={() => setFilter("returned")}
              label="Returned"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-border bg-card/60 backdrop-blur overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-4 text-xs font-semibold text-foreground/60">
          <div className="col-span-3">Borrower</div>
          <div className="col-span-3">Book</div>
          <div className="col-span-2">Checked out</div>
          <div className="col-span-2">Returned</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="divide-y divide-border">
          {isLoading && (
            <div className="px-5 py-6 text-sm text-foreground/70">
              Loading history...
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-lg font-semibold">No history found</p>
              <p className="mt-1 text-sm text-foreground/60">
                Try changing filters or search.
              </p>
            </div>
          )}

          {filtered.map((h) => {
            const active = !h.return_date;
            const bookTitle = h.book_title || h.title || "—";
            const borrower = h.user_name || (tab === "user" ? user?.name : "—");

            return (
              <div key={h.id} className="px-5 py-4">
                <div className="hidden md:grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-3">
                    <p className="font-semibold">{borrower}</p>
                    <p className="text-xs text-foreground/60">
                      {h.email ? h.email : `User #${h.user_id || "—"}`}
                    </p>
                  </div>

                  <div className="col-span-3">
                    <p className="font-semibold">{bookTitle}</p>
                    <p className="text-xs text-foreground/60">
                      Book #{h.book_id} • Entry #{h.id}
                    </p>
                  </div>

                  <div className="col-span-2 text-foreground/80">
                    {fmtDate(h.checkout_date)}
                  </div>
                  <div className="col-span-2 text-foreground/80">
                    {h.return_date ? fmtDate(h.return_date) : "—"}
                  </div>

                  <div className="col-span-1">
                    <StatusPill active={active} />
                  </div>

                  <div className="col-span-1 flex justify-end">
                    {active && tab === "user" ? (
                      <button
                        onClick={() => onReturn(h)}
                        className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white
                                   hover:bg-emerald-700 dark:bg-emerald-400 dark:text-slate-900 dark:hover:bg-emerald-300 transition"
                      >
                        Return
                      </button>
                    ) : (
                      <span className="text-xs text-foreground/50">—</span>
                    )}
                  </div>
                </div>

                {/* Mobile */}
                <div className="md:hidden space-y-2">
                  <div className="rounded-2xl border border-border bg-background/30 p-3">
                    <p className="text-xs text-foreground/60">Borrower</p>
                    <p className="mt-1 font-semibold">{borrower}</p>
                    <p className="text-xs text-foreground/60">
                      {h.email ? h.email : `User #${h.user_id || "—"}`}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background/30 p-3">
                    <p className="text-xs text-foreground/60">Book</p>
                    <p className="mt-1 font-semibold">{bookTitle}</p>
                    <p className="text-xs text-foreground/60">
                      Book #{h.book_id} • Entry #{h.id}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-foreground/80">
                    <div className="rounded-2xl border border-border bg-background/30 p-3">
                      <p className="text-xs text-foreground/60">Checked out</p>
                      <p className="mt-1 font-semibold">
                        {fmtDate(h.checkout_date)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/30 p-3">
                      <p className="text-xs text-foreground/60">Returned</p>
                      <p className="mt-1 font-semibold">
                        {h.return_date ? fmtDate(h.return_date) : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <StatusPill active={active} />
                    {active && tab === "user" && (
                      <button
                        onClick={() => onReturn(h)}
                        className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white
                                   dark:bg-emerald-400 dark:text-slate-900"
                      >
                        Return
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* UI */
function TabButton({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition border
        ${
          active
            ? "bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-400 dark:text-slate-900 dark:border-indigo-400"
            : "bg-background/30 text-foreground/70 border-border hover:bg-background/50"
        }`}
    >
      {label}
    </button>
  );
}

function FilterPill({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition border
        ${
          active
            ? "bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-400 dark:text-slate-900 dark:border-indigo-400"
            : "bg-background/30 text-foreground/70 border-border hover:bg-background/50"
        }`}
    >
      {label}
    </button>
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
