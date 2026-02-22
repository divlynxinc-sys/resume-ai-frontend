import type { ReactNode } from "react";

type BadgeVariant = "blue" | "green" | "red" | "gray";

function Badge({ label, variant = "gray" }: { label: string; variant?: BadgeVariant }) {
  const variants: Record<BadgeVariant, string> = {
    blue: "bg-[oklch(0.488_0.243_264.376)/18] text-[oklch(0.488_0.243_264.376)] border border-[oklch(0.488_0.243_264.376)/35]",
    green: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    red: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
    gray: "bg-white/10 text-white/80 border border-white/20",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>{label}</span>
  );
}

function Sidebar() {
  const navItem = (label: string, active?: boolean) => (
    <a
      key={label}
      href="#"
      className={`flex items-center h-10 rounded-md px-3 text-sm transition-colors border ${
        active
          ? "bg-[oklch(0.488_0.243_264.376)/16] text-white border-[oklch(0.488_0.243_264.376)/35]"
          : "text-white/80 border-transparent hover:bg-white/5"
      }`}
    >
      {label}
    </a>
  );

  return (
    <aside className="w-64 bg-[#0f162a] border-r border-white/10 min-h-svh flex flex-col">
      <div className="h-16 flex items-center px-6">
        <div className="size-5 rounded-md bg-[oklch(0.488_0.243_264.376)] mr-2" />
        <span className="text-white font-semibold">ResumePro</span>
      </div>
      <nav className="px-4 space-y-2">
        {navItem("Dashboard", true)}
        {navItem("Users")}
        {navItem("Subscriptions")}
        {navItem("Feedback")}
        {navItem("Settings")}
      </nav>
      <div className="mt-auto px-6 py-6 text-white/70">
        <a href="#" className="inline-flex items-center gap-2 text-sm hover:text-white">
          <span className="inline-block rotate-180">➜</span>
          Go to app
        </a>
      </div>
    </aside>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
      <div className="text-white/70 text-sm">{title}</div>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function Table({
  columns,
  rows,
}: {
  columns: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="text-white/60">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-3 text-left font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-white/3">
              {r.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-white/90">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  const users = [
    { name: "Ethan Harper", email: "ethan.harper@email.com", subscription: "Premium", status: "Active" },
    { name: "Olivia Bennett", email: "olivia.bennett@email.com", subscription: "Free", status: "Inactive" },
    { name: "Liam Carter", email: "liam.carter@email.com", subscription: "Premium", status: "Active" },
    { name: "Ava Davis", email: "ava.davis@email.com", subscription: "Free", status: "Active" },
    { name: "Noah Evans", email: "noah.evans@email.com", subscription: "Premium", status: "Inactive" },
  ];

  const subscriptions = [
    { plan: "Free", price: "$0", users: 100, status: "Active" },
    { plan: "Premium", price: "$9.99", users: 50, status: "Active" },
    { plan: "Enterprise", price: "$49.99", users: 10, status: "Active" },
  ];

  const feedback = [
    { user: "Ethan Harper", text: "Great app, easy to use!", date: "2024-01-15" },
    { user: "Olivia Bennett", text: "Could use more templates.", date: "2024-02-20" },
    { user: "Liam Carter", text: "Love the AI suggestions.", date: "2024-03-10" },
    { user: "Ava Davis", text: "The interface is clean and modern.", date: "2024-04-05" },
    { user: "Noah Evans", text: "Need more customization options.", date: "2024-05-01" },
  ];

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <StatCard title="Total Resumes Created" value="1,234" />
            <StatCard title="Active Users" value="567" />
            <StatCard title="Total Feedback" value="89" />
          </div>
          <section className="mt-8">
            <h2 className="text-lg font-semibold">User Management</h2>
            <div className="mt-3">
              {/* table injected by Table component */}
              <Table
                columns={["USER", "EMAIL", "SUBSCRIPTION", "STATUS", "ACTIONS"]}
                rows={users.map((u) => [
                  <span className="font-medium text-white">{u.name}</span>,
                  <span className="text-white/70">{u.email}</span>,
                  <Badge label={u.subscription} variant={u.subscription === "Premium" ? "blue" : "gray"} />,
                  <Badge label={u.status} variant={u.status === "Active" ? "green" : "red"} />,
                  <a href="#" className="text-[oklch(0.488_0.243_264.376)]">View</a>,
                ])}
              />
            </div>
          </section>
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Subscription Management</h2>
            <div className="mt-3">
              <Table
                columns={["PLAN NAME", "PRICE", "USERS", "STATUS", "ACTIONS"]}
                rows={subscriptions.map((s) => [
                  <span className="font-medium text-white">{s.plan}</span>,
                  <span className="text-white/80">{s.price}</span>,
                  <span className="text-white/80">{s.users}</span>,
                  <Badge label={s.status} variant="green" />,
                  <a href="#" className="text-[oklch(0.488_0.243_264.376)]">View</a>,
                ])}
              />
            </div>
          </section>
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Feedback</h2>
            <div className="mt-3">
              <Table
                columns={["USER", "FEEDBACK", "DATE", "ACTIONS"]}
                rows={feedback.map((f) => [
                  <span className="font-medium text-white">{f.user}</span>,
                  <span className="text-white/80">{f.text}</span>,
                  <span className="text-white/70">{f.date}</span>,
                  <a href="#" className="text-[oklch(0.488_0.243_264.376)]">View</a>,
                ])}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}