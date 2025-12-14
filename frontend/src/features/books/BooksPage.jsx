import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchBooks,
  createBook,
  updateBookById,
  deleteBookById,
  toggleCheckoutReturn,
} from "./booksSlice";
import BookModal from "./BookModal";

export default function BooksPage() {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((s) => s.books);
  const { role } = useSelector((s) => s.auth);

  // Admin can CRUD. Members (librarian treated as member) can only checkout/return + view/search.
  const canManage = role === "admin";
  const canBorrow =
    role === "admin" || role === "librarian" || role === "member";

  const [q, setQ] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((b) => {
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
          .includes(query)
      );
    });
  }, [items, q, onlyAvailable]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (book) => {
    setEditing(book);
    setModalOpen(true);
  };

  const onSave = async (payload) => {
    if (!canManage) return toast.error("You don’t have permission.");

    if (editing?.id) {
      await dispatch(updateBookById({ bookId: editing.id, payload })).unwrap();
    } else {
      await dispatch(createBook(payload)).unwrap();
    }

    setModalOpen(false);
    setEditing(null);
    // slice already fetches, but keeping UX safe
    dispatch(fetchBooks());
  };

  const onDelete = async (book) => {
    if (!canManage) return toast.error("You don’t have permission.");
    const ok = confirm(`Delete "${book.title}"?`);
    if (!ok) return;

    await dispatch(deleteBookById(book.id)).unwrap();
    dispatch(fetchBooks());
  };

  const onToggleBorrow = async (book) => {
    if (!canBorrow) return toast.error("You don’t have permission.");

    await dispatch(toggleCheckoutReturn(book)).unwrap();

    dispatch(fetchBooks());
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Books</h1>
          <p className="mt-1 text-sm text-foreground/65">
            Search, review availability, and maintain a clean catalog.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => dispatch(fetchBooks())}
            className="rounded-2xl border border-border bg-card/60 px-4 py-2 font-semibold hover:bg-card/80 transition"
          >
            Refresh
          </button>

          {canManage && (
            <button
              onClick={openAdd}
              className="rounded-2xl bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-400 dark:text-slate-900 dark:hover:bg-emerald-300 transition"
            >
              + Add Book
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, author, language, year..."
              className="w-full rounded-2xl border border-border bg-background/40 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
            />
          </div>

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

      {/* Table */}
      <div className="rounded-3xl border border-border bg-card/60 backdrop-blur overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-4 text-xs font-semibold text-foreground/60">
          <div className="col-span-4">Title</div>
          <div className="col-span-3">Author</div>
          <div className="col-span-2">Language</div>
          <div className="col-span-1">Year</div>
          <div className="col-span-2 text-right">Actions</div>
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
                {/* Desktop row */}
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
                    {b.language || "-"}
                  </div>
                  <div className="col-span-1 text-foreground/80">
                    {b.year || "-"}
                  </div>

                  <div className="col-span-2 flex justify-end gap-2">
                    {/* Borrow/Return for allowed roles */}
                    {canBorrow && (
                      <button
                        onClick={() => onToggleBorrow(b)}
                        className={`rounded-xl px-3 py-2 text-sm font-semibold transition
                          ${
                            available
                              ? "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-400 dark:text-slate-900 dark:hover:bg-indigo-300"
                              : "bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-400 dark:text-slate-900 dark:hover:bg-amber-300"
                          }`}
                      >
                        {available ? "Check out" : "Return"}
                      </button>
                    )}

                    {/* Admin-only CRUD */}
                    {canManage && (
                      <>
                        <button
                          onClick={() => openEdit(b)}
                          className="rounded-xl border border-border bg-background/30 px-3 py-2 text-sm font-semibold hover:bg-background/50 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(b)}
                          className="rounded-xl border border-border bg-background/30 px-3 py-2 text-sm font-semibold hover:bg-background/50 transition"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile card */}
                <div className="md:hidden space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold">{b.title}</p>
                      <p className="text-sm text-foreground/70">{b.author}</p>
                    </div>
                    <AvailabilityPill available={b.available} />
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-foreground/70">
                    <Tag label={b.language || "—"} />
                    <Tag label={b.year || "—"} />
                    <Tag label={`#${b.id}`} />
                  </div>

                  <div className="flex gap-2 pt-2">
                    {canBorrow && (
                      <button
                        onClick={() => onToggleBorrow(b)}
                        className={`flex-1 rounded-2xl px-3 py-2 text-sm font-semibold transition
                          ${
                            available
                              ? "bg-indigo-600 text-white dark:bg-indigo-400 dark:text-slate-900"
                              : "bg-amber-600 text-white dark:bg-amber-400 dark:text-slate-900"
                          }`}
                      >
                        {available ? "Check out" : "Return"}
                      </button>
                    )}

                    {canManage && (
                      <>
                        <button
                          onClick={() => openEdit(b)}
                          className="flex-1 rounded-2xl border border-border bg-background/30 px-3 py-2 text-sm font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(b)}
                          className="flex-1 rounded-2xl border border-border bg-background/30 px-3 py-2 text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BookModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        initial={editing}
        onSubmit={onSave}
        isLoading={isLoading}
      />
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
