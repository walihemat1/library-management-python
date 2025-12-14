import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

const itemClass = ({ isActive }) =>
  `
    flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition
    ${
      isActive
        ? "bg-indigo-600 text-white dark:bg-indigo-400 dark:text-slate-900"
        : "text-foreground/75 hover:text-foreground hover:bg-card"
    }
  `;

const navItems = [
  { title: "Dashboard", path: "/admin/dashboard", type: "admin", icon: "⏹️" },
  {
    title: "Dashboard",
    path: "/librarian/dashboard",
    type: "librarian",
    icon: "📖",
  },
  { title: "Books", path: "/librarian/library", type: "librarian", icon: "📖" },
  { title: "Books", path: "/admin/books", type: "admin", icon: "📖" },
  { title: "Users", path: "/admin/users", type: "admin", icon: "👥" },
];

export default function AppSidebar({ open, onClose }) {
  const { user } = useSelector((state) => state.auth);
  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`
          fixed left-0 top-0 z-50 h-full w-72
          border-r border-border bg-background/80 backdrop-blur
          transition-transform
          md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm dark:bg-indigo-400 dark:text-slate-900">
              📚
            </div>
            <div className="leading-tight">
              <p className="font-bold">Library</p>
              <p className="text-xs text-foreground/60">Dashboard</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden rounded-xl border border-border bg-card px-3 py-2 text-sm"
          >
            ✕
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            if (item.type === user.role)
              return (
                <NavLink key={item.path} to={item.path} className={itemClass}>
                  <span className="text-lg">{item.icon}</span> {item.title}
                </NavLink>
              );
          })}
          <NavLink to="/history" className={itemClass}>
            <span className="text-lg">🕘</span> History
          </NavLink>
          <NavLink to="/profile" className={itemClass}>
            <span className="text-lg">🙋</span> My Account
          </NavLink>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="rounded-2xl border border-border bg-card/70 p-4 text-sm text-foreground/70">
            Tip: Use{" "}
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              Search
            </span>{" "}
            to quickly find books.
          </div>
        </div>
      </aside>
    </>
  );
}
