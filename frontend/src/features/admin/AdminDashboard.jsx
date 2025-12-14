import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { fetchAdminDashboard } from "./adminDashboardSlice";
import LoadingSpinner from "../../components/LoadingSpinner";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSelector((s) => s.adminDashboard);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const totals = data?.totals || {
    total_books: 0,
    total_users: 0,
    active_loans: 0,
  };
  const trend = data?.trend_7d || [];
  const topBooks = data?.top_books || [];
  const topUsers = data?.top_users || [];
  const avgDays = data?.avg_borrow_days ?? 0;

  const topBooksPie = useMemo(() => {
    return topBooks.map((b) => ({
      name:
        (b.title || "—").slice(0, 18) +
        ((b.title || "").length > 18 ? "…" : ""),
      value: Number(b.count || 0),
      full: b.title || "—",
      book_id: b.book_id,
    }));
  }, [topBooks]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-foreground/65">
            Key metrics and trends — quick, clean, and mobile-friendly.
          </p>
        </div>

        <button
          onClick={() => dispatch(fetchAdminDashboard())}
          className="rounded-2xl border border-border bg-card/60 px-4 py-2 font-semibold hover:bg-card/80 transition"
        >
          Refresh
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-8">
          <div className="flex items-center justify-center">
            <LoadingSpinner label="Loading dashboard..." />
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Top KPIs + mini charts */}
          <div className="grid gap-4 lg:grid-cols-3">
            <KpiCard
              title="Total books"
              value={totals.total_books}
              subtitle="Catalog size"
              mini={<MiniSparkline data={trend} dataKey="count" />}
            />
            <KpiCard
              title="Total users"
              value={totals.total_users}
              subtitle="All accounts"
              mini={<MiniSparkline data={trend} dataKey="count" />}
            />
            <KpiCard
              title="Active loans"
              value={totals.active_loans}
              subtitle="Not returned yet"
              mini={<MiniSparkline data={trend} dataKey="count" />}
              accent="amber"
            />
          </div>

          {/* Trend + Avg Duration */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Borrowing trend (last 7 days)"
                subtitle="Daily checkout counts"
              />
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trend}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="fillTrend"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="currentColor"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="currentColor"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => d.slice(5)}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<NiceTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="currentColor"
                      fill="url(#fillTrend)"
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 text-xs text-foreground/55">
                Tip: spikes usually mean popular books or busy days.
              </p>
            </Card>

            <Card>
              <CardHeader
                title="Average borrow duration"
                subtitle="Returned loans only"
              />
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-black tracking-tight">
                    {avgDays}
                  </p>
                  <p className="mt-1 text-sm text-foreground/65">days</p>
                </div>
                <div className="h-24 w-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ name: "avg", value: avgDays }]}>
                      <Tooltip content={<NiceTooltip />} />
                      <Bar dataKey="value" radius={[12, 12, 12, 12]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-background/30 p-3 text-xs text-foreground/70">
                If this stays high, consider due-date reminders or more copies
                for popular titles.
              </div>
            </Card>
          </div>

          {/* Top books + top users */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="Top 5 most borrowed books"
                subtitle="All-time checkouts"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<NiceTooltip />} />
                      <Pie
                        data={topBooksPie}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {topBooksPie.map((_, idx) => (
                          <Cell key={idx} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {topBooks.map((b) => (
                    <div
                      key={b.book_id}
                      className="rounded-2xl border border-border bg-background/30 p-3"
                    >
                      <p className="text-sm font-semibold line-clamp-1">
                        {b.title || "—"}
                      </p>
                      <p className="mt-1 text-xs text-foreground/60">
                        Book #{b.book_id} •{" "}
                        <span className="font-semibold text-foreground">
                          {b.count}
                        </span>{" "}
                        borrows
                      </p>
                    </div>
                  ))}
                  {topBooks.length === 0 && (
                    <div className="text-sm text-foreground/60">
                      No data yet.
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Top active users" subtitle="Most checkouts" />
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topUsers}
                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      tickFormatter={(v) =>
                        v?.length > 10 ? v.slice(0, 10) + "…" : v
                      }
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<NiceTooltip />} />
                    <Bar dataKey="count" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-2">
                {topUsers.map((u) => (
                  <div
                    key={u.user_id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-background/30 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">{u.name || "—"}</p>
                      <p className="text-xs text-foreground/60">
                        {u.email || "—"}
                      </p>
                    </div>
                    <span className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-bold">
                      {u.count}
                    </span>
                  </div>
                ))}
                {topUsers.length === 0 && (
                  <div className="text-sm text-foreground/60">No data yet.</div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

/* ===================== UI Components ===================== */

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-border bg-card/60 backdrop-blur p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <p className="text-base font-extrabold tracking-tight">{title}</p>
      <p className="mt-1 text-xs text-foreground/60">{subtitle}</p>
    </div>
  );
}

function KpiCard({ title, value, subtitle, mini, accent = "indigo" }) {
  const ring =
    accent === "amber"
      ? "ring-amber-500/10 border-amber-400/20"
      : "ring-indigo-500/10 border-indigo-400/20";

  return (
    <div
      className={`rounded-3xl border ${ring} bg-card/60 backdrop-blur p-5 ring-1`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-foreground/60">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-foreground/60">{subtitle}</p>
        </div>

        <div className="hidden sm:block h-16 w-28 text-foreground">{mini}</div>
      </div>

      <div className="mt-4 sm:hidden h-16 w-full text-foreground">{mini}</div>
    </div>
  );
}

function MiniSparkline({ data, dataKey }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Tooltip content={<NiceTooltip compact />} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="currentColor"
          strokeWidth={2.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function NiceTooltip({ active, payload, label, compact }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border bg-background/90 backdrop-blur px-3 py-2 shadow-sm">
      {!compact && (
        <p className="text-xs font-semibold text-foreground/70">
          {String(label || "")}
        </p>
      )}
      {payload.map((p, idx) => (
        <p key={idx} className="text-sm font-bold">
          {p.name}: <span className="font-black">{p.value}</span>
        </p>
      ))}
    </div>
  );
}
