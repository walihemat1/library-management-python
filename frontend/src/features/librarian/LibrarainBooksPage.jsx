import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchLibrarianBooks,
  librarianToggleCheckoutReturn,
} from "./librarianBooksSlice";

export default function LibrarianBooksPage() {
  const dispatch = useDispatch();
  const { books, isLoading, error } = useSelector((s) => s.librarianBooks);
  const { role } = useSelector((s) => s.auth);

  const canUse = role === "librarian" || role === "member" || role === "admin";

  const [q, setQ] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  useEffect(() => {
    if (!canUse) return;
    dispatch(fetchLibrarianBooks());
  }, [dispatch, canUse]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (books || []).filter((b) => {
      if (onlyAvailable && Number(b.available) !== 1) return false;
      if (!query) return true;

      return (
        String(b.title || "")
          .toLowerCase()
          .includes(query) ||
        String(b.author || "")
          .toLowerCase()
          .includes(query) ||
        String(b.language || "")
          .toLowerCase()
          .includes(query) ||
        String(b.year || "")
          .toLowerCase()
          .includes(query) ||
        String(b.id || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [books, q, onlyAvailable]);

  const onToggle = async (book) => {
    if (!canUse) return toast.error("You don’t have permission.");
    try {
      await dispatch(librarianToggleCheckoutReturn(book)).unwrap();
    } catch (_) {}
  };

  if (!canUse) {
    return (
      <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-6">
        <p className="text-lg font-semibold">Forbidden</p>
        <p className="mt-1 text-sm text-foreground/60">
          You don’t have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Library</h1>
          <p className="mt-1 text-sm text-foreground/65">
            Search books and check out / return with one click.
          </p>
        </div>

        <button
          onClick={() => dispatch(fetchLibrarianBooks())}
          className="rounded-2xl border border-border bg-card/60 px-4 py-2 font-semibold hover:bg-card/80 transition"
        >
          Refresh
        </button>
      </div>

      {/* Controls */}
      <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, author, language, year, id..."
            className="w-full md:max-w-lg rounded-2xl border border-border bg-background/40 px-4 py-3
                       focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
          />

          <label className="inline-flex items-center gap-2 text-sm text-foreground/70">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Available only
          </label>
        </div>
      </div>

      {/* List */}
      <div className="rounded-3xl border border-border bg-card/60 backdrop-blur overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-4 text-xs font-semibold text-foreground/60">
          <div className="col-span-4">Title</div>
          <div className="col-span-3">Author</div>
          <div className="col-span-2">Language</div>
          <div className="col-span-1">Year</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        <div className="divide-y divide-border">
          {isLoading && (
            <div className="px-5 py-6 text-sm text-foreground/70">
              Loading books...
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-lg font-semibold">No books found</p>
              <p className="mt-1 text-sm text-foreground/60">
                Try a different search or clear filters.
              </p>
            </div>
          )}

          {filtered.map((b) => {
            const available = Number(b.available) === 1;

            return (
              <div key={b.id} className="px-5 py-4">
                {/* Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-4">
                    <div className="flex items-center gap-3">
                      <AvailabilityPill available={b.available} />
                      <div>
                        <p className="font-semibold">{b.title}</p>
                        <p className="text-xs text-foreground/60">#{b.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 text-foreground/80">
                    {b.author}
                  </div>
                  <div className="col-span-2 text-foreground/80">
                    {b.language || "—"}
                  </div>
                  <div className="col-span-1 text-foreground/80">
                    {b.year || "—"}
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => onToggle(b)}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold transition
                        ${
                          available
                            ? "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-400 dark:text-slate-900 dark:hover:bg-indigo-300"
                            : "bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-400 dark:text-slate-900 dark:hover:bg-amber-300"
                        }`}
                    >
                      {available ? "Check out" : "Return"}
                    </button>
                  </div>
                </div>

                {/* Mobile */}
                <div className="md:hidden space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold">{b.title}</p>
                      <p className="text-sm text-foreground/70">{b.author}</p>
                      <p className="text-xs text-foreground/60">#{b.id}</p>
                    </div>
                    <AvailabilityPill available={b.available} />
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-foreground/70">
                    <Tag label={b.language || "—"} />
                    <Tag label={b.year || "—"} />
                  </div>

                  <button
                    onClick={() => onToggle(b)}
                    className={`w-full rounded-2xl px-4 py-2.5 text-sm font-semibold transition
                      ${
                        available
                          ? "bg-indigo-600 text-white dark:bg-indigo-400 dark:text-slate-900"
                          : "bg-amber-600 text-white dark:bg-amber-400 dark:text-slate-900"
                      }`}
                  >
                    {available ? "Check out" : "Return"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AvailabilityPill({ available }) {
  const isAvail = Number(available) === 1;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold
        ${
          isAvail
            ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
        }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isAvail ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      {isAvail ? "Available" : "Checked out"}
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
