import { useEffect, useMemo, useState } from "react";

export default function BookModal({
  open,
  onClose,
  initial,
  onSubmit,
  isLoading,
}) {
  const isEdit = !!initial?.id;

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [language, setLanguage] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title || "");
    setAuthor(initial?.author || "");
    setYear(initial?.year ?? "");
    setLanguage(initial?.language || "");
  }, [open, initial]);

  const canSave = useMemo(() => {
    return title.trim().length > 1 && author.trim().length > 1 && !isLoading;
  }, [title, author, isLoading]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <button
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/40 dark:bg-black/60 backdrop-blur-sm"
      />

      {/* panel */}
      <div className="absolute inset-0 grid place-items-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="
            relative w-full max-w-lg
            rounded-3xl border border-slate-200 dark:border-slate-700
            bg-white dark:bg-slate-900
            shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)]
            dark:shadow-[0_30px_80px_-45px_rgba(0,0,0,0.85)]
            overflow-hidden
          "
        >
          {/* header */}
          <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {isEdit ? "Edit Book" : "Add Book"}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Keep details clean for better search and tracking.
              </p>
            </div>

            <button
              onClick={onClose}
              className="
                rounded-2xl border border-slate-200 dark:border-slate-700
                bg-white hover:bg-slate-50
                dark:bg-slate-800/60 dark:hover:bg-slate-800
                px-3 py-2 text-sm font-semibold
                text-slate-800 dark:text-slate-100
                transition
              "
            >
              ✕
            </button>
          </div>

          {/* body */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid gap-4">
              <Field label="Title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="
                    w-full rounded-2xl border border-slate-200 dark:border-slate-700
                    bg-white dark:bg-slate-800/40
                    px-4 py-3
                    text-slate-900 dark:text-slate-100
                    placeholder:text-slate-400 dark:placeholder:text-slate-400
                    focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20
                  "
                  placeholder="The Great Gatsby"
                />
              </Field>

              <Field label="Author">
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="
                    w-full rounded-2xl border border-slate-200 dark:border-slate-700
                    bg-white dark:bg-slate-800/40
                    px-4 py-3
                    text-slate-900 dark:text-slate-100
                    placeholder:text-slate-400 dark:placeholder:text-slate-400
                    focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20
                  "
                  placeholder="F. Scott Fitzgerald"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Year">
                  <input
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    inputMode="numeric"
                    className="
                      w-full rounded-2xl border border-slate-200 dark:border-slate-700
                      bg-white dark:bg-slate-800/40
                      px-4 py-3
                      text-slate-900 dark:text-slate-100
                      placeholder:text-slate-400 dark:placeholder:text-slate-400
                      focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20
                    "
                    placeholder="1925"
                  />
                </Field>

                <Field label="Language">
                  <input
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="
                      w-full rounded-2xl border border-slate-200 dark:border-slate-700
                      bg-white dark:bg-slate-800/40
                      px-4 py-3
                      text-slate-900 dark:text-slate-100
                      placeholder:text-slate-400 dark:placeholder:text-slate-400
                      focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20
                    "
                    placeholder="English"
                  />
                </Field>
              </div>
            </div>

            {/* footer */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={onClose}
                className="
                  rounded-2xl border border-slate-200 dark:border-slate-700
                  bg-white hover:bg-slate-50
                  dark:bg-slate-800/40 dark:hover:bg-slate-800/60
                  px-4 py-3 font-semibold
                  text-slate-800 dark:text-slate-100
                  transition
                "
              >
                Cancel
              </button>

              <button
                disabled={!canSave}
                onClick={() =>
                  onSubmit({
                    title: title.trim(),
                    author: author.trim(),
                    year: year === "" ? null : Number(year),
                    language: language.trim(),
                  })
                }
                className={`rounded-2xl px-4 py-3 font-semibold transition
                  ${
                    canSave
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-400 dark:hover:bg-indigo-300 dark:text-slate-900"
                      : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed"
                  }`}
              >
                {isLoading ? "Saving..." : isEdit ? "Save Changes" : "Add Book"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </label>
      {children}
    </div>
  );
}
