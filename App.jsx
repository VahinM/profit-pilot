import React, { useState, useMemo, useEffect, useCallback } from "react";
import { supabase } from "./supabase.js";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  LayoutDashboard, Receipt, FileText, Users, BarChart3, Sparkles,
  Settings, CreditCard, Plus, Search, Filter, Download, ChevronRight,
  ArrowUpRight, ArrowDownRight, DollarSign, Wallet, TrendingUp,
  AlertCircle, Check, X, Menu, Bell, Store, Coffee, Wrench, Scissors,
  Send, MoreHorizontal, Camera, Building2, ShieldCheck, Zap, Clock, Star, ArrowRight, LogOut
} from "lucide-react";

// ---------- Mock data ----------

const revenueExpenseData = [
  { month: "Feb", revenue: 8200, expenses: 5100 },
  { month: "Mar", revenue: 9100, expenses: 5600 },
  { month: "Apr", revenue: 8700, expenses: 6200 },
  { month: "May", revenue: 10400, expenses: 6000 },
  { month: "Jun", revenue: 11200, expenses: 6800 },
  { month: "Jul", revenue: 12850, expenses: 7150 },
];

const expenseBreakdown = [
  { name: "Inventory", value: 2400, color: "#1F7A5C" },
  { name: "Rent", value: 1800, color: "#B5533C" },
  { name: "Payroll", value: 1600, color: "#D4A24C" },
  { name: "Utilities", value: 620, color: "#6B7680" },
  { name: "Supplies", value: 430, color: "#8B9DA8" },
  { name: "Other", value: 300, color: "#C9C2B4" },
];

const transactions = [
  { id: 1, merchant: "Sysco Foods", category: "Inventory", amount: -840.22, date: "Jul 8", method: "Card •• 4471", status: "Cleared" },
  { id: 2, merchant: "Maple & Co Invoice #1042", category: "Revenue", amount: 1250.0, date: "Jul 8", method: "ACH", status: "Cleared" },
  { id: 3, merchant: "PG&E", category: "Utilities", amount: -212.4, date: "Jul 7", method: "Auto-pay", status: "Cleared" },
  { id: 4, merchant: "Riverside Plaza LLC", category: "Rent", amount: -1800.0, date: "Jul 5", method: "ACH", status: "Cleared" },
  { id: 5, merchant: "Jenna's Salon Supply", category: "Supplies", amount: -128.9, date: "Jul 4", method: "Card •• 4471", status: "Pending" },
  { id: 6, merchant: "Downtown Farmers Co-op", category: "Revenue", amount: 640.0, date: "Jul 3", method: "Cash", status: "Cleared" },
  { id: 7, merchant: "Payroll — 3 staff", category: "Payroll", amount: -1600.0, date: "Jul 1", method: "Direct deposit", status: "Cleared" },
];

const invoices = [
  { id: "INV-1042", customer: "Maple & Co", amount: 1250.0, due: "Jul 8", status: "Paid" },
  { id: "INV-1043", customer: "Corner Bistro", amount: 480.0, due: "Jul 15", status: "Pending" },
  { id: "INV-1044", customer: "Green Leaf Market", amount: 920.0, due: "Jul 2", status: "Overdue" },
  { id: "INV-1045", customer: "Union Coffee Roasters", amount: 310.0, due: "Jul 22", status: "Pending" },
  { id: "INV-1046", customer: "Westside Diner", amount: 675.5, due: "Jun 28", status: "Overdue" },
  { id: "INV-1047", customer: "The Book Nook", amount: 150.0, due: "Jul 30", status: "Draft" },
];

const customers = [
  { name: "Maple & Co", company: "Maple & Co Catering", revenue: 8400, invoices: 6, lastPaid: "Jul 8" },
  { name: "Corner Bistro", company: "Corner Bistro LLC", revenue: 3100, invoices: 4, lastPaid: "Jun 20" },
  { name: "Green Leaf Market", company: "Green Leaf Market Inc", revenue: 5600, invoices: 5, lastPaid: "May 30" },
  { name: "Union Coffee Roasters", company: "Union Roasters Co", revenue: 2200, invoices: 3, lastPaid: "Jun 15" },
];

const initialIncome = [
  { id: 1, source: "Maple & Co", desc: "Catering — corporate lunch (INV-1042)", amount: 1250.0, date: "Jul 8", method: "ACH", type: "Invoice payment", status: "Cleared" },
  { id: 2, source: "Square POS", desc: "Daily sales — 84 orders", amount: 1132.5, date: "Jul 7", method: "Card sales", type: "POS import", status: "Cleared" },
  { id: 3, source: "Square POS", desc: "Daily sales — 71 orders", amount: 968.0, date: "Jul 6", method: "Card sales", type: "POS import", status: "Cleared" },
  { id: 4, source: "Downtown Farmers Co-op", desc: "Market stall — Saturday", amount: 640.0, date: "Jul 3", method: "Cash", type: "Manual entry", status: "Cleared" },
  { id: 5, source: "Private client", desc: "Birthday party catering deposit", amount: 300.0, date: "Jul 2", method: "Venmo", type: "Manual entry", status: "Cleared" },
  { id: 6, source: "Square POS", desc: "Daily sales — 66 orders", amount: 890.25, date: "Jul 1", method: "Card sales", type: "POS import", status: "Cleared" },
];

const CATEGORY_COLORS = {
  Inventory: { bg: "#E3F0E8", fg: "#1F7A5C" },
  Revenue: { bg: "#E3F0E8", fg: "#1F7A5C" },
  Rent: { bg: "#F6E7E1", fg: "#B5533C" },
  Payroll: { bg: "#F5EBD5", fg: "#8A6A2E" },
  Utilities: { bg: "#E1EEEF", fg: "#2E6E75" },
  Supplies: { bg: "#F0E5EC", fg: "#7A4E68" },
  Other: { bg: "#EEEDE7", fg: "#6B7680" },
};

function CategoryChip({ name }) {
  const c = CATEGORY_COLORS[name] || CATEGORY_COLORS.Other;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full" style={{ background: c.bg, color: c.fg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.fg }} />
      {name}
    </span>
  );
}

const EXPENSE_CATEGORIES = [
  ["advertising", "Advertising"], ["fuel", "Fuel"], ["office_supplies", "Office supplies"],
  ["equipment", "Equipment"], ["rent", "Rent"], ["payroll", "Payroll"], ["meals", "Meals"],
  ["travel", "Travel"], ["insurance", "Insurance"], ["utilities", "Utilities"],
  ["software", "Software"], ["taxes", "Taxes"], ["inventory", "Inventory"],
  ["supplies", "Supplies"], ["other", "Other"],
];
const CATEGORY_LABELS = Object.fromEntries(EXPENSE_CATEGORIES);
const PAYMENT_METHODS = ["Card", "Cash", "ACH", "Check", "Auto-pay", "Other"];

const prettyDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
const todayISO = () => new Date().toISOString().slice(0, 10);

const statusStyle = {
  Paid: "bg-[#E8F3EC] text-[#1F7A5C]",
  Cleared: "bg-[#E8F3EC] text-[#1F7A5C]",
  Pending: "bg-[#FBF2E2] text-[#9C7A2E]",
  Overdue: "bg-[#F8E9E4] text-[#B5533C]",
  Draft: "bg-[#EEEDE7] text-[#6B7680]",
};

const currency = (n) =>
  (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------- Small building blocks ----------

function LedgerCard({ children, className = "" }) {
  return (
    <div className={`relative bg-[#FFFDF9] rounded-xl border border-[#E7E1D4] shadow-[0_1px_2px_rgba(28,43,51,0.04)] ${className}`}>
      <div
        className="absolute -top-[1px] left-0 right-0 h-2 overflow-hidden rounded-t-xl"
        style={{
          backgroundImage:
            "radial-gradient(circle at 6px 0px, transparent 4px, #FFFDF9 4.5px)",
          backgroundSize: "12px 8px",
          backgroundRepeat: "repeat-x",
        }}
      />
      {children}
    </div>
  );
}

const ACCENTS = {
  green: { chip: "#E3F0E8", icon: "#1F7A5C", thread: "#1F7A5C" },
  rust: { chip: "#F6E7E1", icon: "#B5533C", thread: "#B5533C" },
  gold: { chip: "#F5EBD5", icon: "#8A6A2E", thread: "#D4A24C" },
  teal: { chip: "#E1EEEF", icon: "#2E6E75", thread: "#2E6E75" },
  plum: { chip: "#F0E5EC", icon: "#7A4E68", thread: "#7A4E68" },
  ink: { chip: "#E6E9EB", icon: "#1C2B33", thread: "#1C2B33" },
};

function KPICard({ label, value, delta, positive, icon: Icon, sparkline, accent = "gold" }) {
  const a = ACCENTS[accent] || ACCENTS.gold;
  return (
    <LedgerCard className="p-5 pt-6 overflow-hidden">
      <div className="absolute top-2 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(to right, ${a.thread}, transparent 70%)`, opacity: 0.5 }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: a.chip }}>
          <Icon size={17} style={{ color: a.icon }} strokeWidth={2} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${positive ? "bg-[#E8F3EC] text-[#1F7A5C]" : "bg-[#F8E9E4] text-[#B5533C]"}`}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {delta}
        </div>
      </div>
      <p className="text-[13px] text-[#6B7680] mb-1">{label}</p>
      <p className="font-['Roboto_Slab'] text-2xl text-[#1C2B33] tabular-nums mb-3">{value}</p>
      <div className="h-px bg-[repeating-linear-gradient(to_right,#D8D0BC_0,#D8D0BC_4px,transparent_4px,transparent_8px)]" />
      {sparkline && (
        <div className="h-8 mt-2 -mb-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline}>
              <Line type="monotone" dataKey="v" stroke={a.icon} strokeWidth={1.75} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </LedgerCard>
  );
}

function StatusPill({ status }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[status] || "bg-[#EEEDE7] text-[#6B7680]"}`}>
      {status}
    </span>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors ${
        active ? "text-[#FBF8F3]" : "text-[#C8CDD1] hover:bg-[#28394D] hover:text-[#FBF8F3]"
      }`}
      style={active ? { backgroundColor: "#2A3B44" } : {}}
    >
      {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[#D4A24C]" />}
      <Icon size={17} strokeWidth={2} />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="text-[10px] font-semibold bg-[#B5533C] text-white rounded-full px-1.5 py-0.5">
          {badge}
        </span>
      )}
    </button>
  );
}

// ---------- Pages ----------

function DashboardPage() {
  const sparkA = [{ v: 4 }, { v: 6 }, { v: 5 }, { v: 8 }, { v: 7 }, { v: 9 }];
  const sparkB = [{ v: 6 }, { v: 5 }, { v: 7 }, { v: 6 }, { v: 8 }, { v: 7 }];
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl p-6" style={{ background: "linear-gradient(115deg, #1C2B33 0%, #24404A 55%, #2E5A54 100%)" }}>
        <div className="absolute -right-8 -top-10 w-48 h-48 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #D4A24C, transparent 70%)" }} />
        <div className="absolute right-24 -bottom-14 w-40 h-40 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #FBF8F3, transparent 70%)" }} />
        <div className="relative flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium text-[#D4A24C] uppercase tracking-widest mb-1.5">Friday, July 10</p>
            <h1 className="font-['Roboto_Slab'] text-[24px] text-[#FBF8F3]">Good morning, Dana</h1>
            <p className="text-[13px] text-[#AEBBC2] mt-1">Maple & Thyme Kitchen is having its best month this year — profit is up 21% and two invoices need a nudge.</p>
          </div>
          <div className="text-right shrink-0 ml-6">
            <p className="text-[12px] text-[#AEBBC2]">Net profit · July</p>
            <p className="font-['Roboto_Slab'] text-[32px] text-[#FBF8F3] tabular-nums leading-tight">$5,700</p>
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#7BC9A3] bg-[#FFFFFF14] px-2 py-0.5 rounded-full mt-1">
              <ArrowUpRight size={12} /> +21.3% vs June
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-medium text-[#6B7680]">This month at a glance</h2>
        <button className="flex items-center gap-2 bg-[#1C2B33] text-white text-[13px] font-medium px-4 py-2.5 rounded-lg hover:bg-[#243944] transition-colors">
          <Plus size={16} /> Add expense
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Revenue this month" value="$12,850" delta="+14.7%" positive icon={DollarSign} sparkline={sparkA} accent="green" />
        <KPICard label="Expenses this month" value="$7,150" delta="+5.2%" positive={false} icon={Receipt} sparkline={sparkB} accent="rust" />
        <KPICard label="Net profit" value="$5,700" delta="+21.3%" positive icon={TrendingUp} sparkline={sparkA} accent="gold" />
        <KPICard label="Cash balance" value="$18,420" delta="+3.1%" positive icon={Wallet} sparkline={sparkB} accent="teal" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <KPICard label="Outstanding invoices" value="$1,745" delta="2 overdue" positive={false} icon={FileText} accent="plum" />
        <KPICard label="Profit margin" value="44.4%" delta="+3.8pt" positive icon={BarChart3} accent="green" />
        <KPICard label="Upcoming bills" value="$2,040" delta="due in 6 days" positive={false} icon={AlertCircle} accent="rust" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <LedgerCard className="col-span-2 p-5 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-medium text-[#1C2B33]">Revenue vs expenses</h3>
            <span className="text-xs text-[#6B7680]">Last 6 months</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueExpenseData} barGap={4}>
                <CartesianGrid vertical={false} stroke="#EDE7D9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#6B7680", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6B7680", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip formatter={(v) => currency(v)} contentStyle={{ borderRadius: 8, border: "1px solid #E7E1D4", fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#1F7A5C" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expenses" fill="#B5533C" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </LedgerCard>

        <LedgerCard className="p-5 pt-6">
          <h3 className="text-[14px] font-medium text-[#1C2B33] mb-4">Where it's going</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseBreakdown} dataKey="value" innerRadius={40} outerRadius={62} paddingAngle={2}>
                  {expenseBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => currency(v)} contentStyle={{ borderRadius: 8, border: "1px solid #E7E1D4", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {expenseBreakdown.slice(0, 4).map((e) => (
              <div key={e.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-[#6B7680]">
                  <span className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                  {e.name}
                </span>
                <span className="text-[#1C2B33] font-medium tabular-nums">{currency(e.value)}</span>
              </div>
            ))}
          </div>
        </LedgerCard>
      </div>

      <LedgerCard className="p-5 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-medium text-[#1C2B33]">Recent activity</h3>
          <button className="text-[13px] text-[#8A6A2E] font-medium flex items-center gap-0.5 hover:underline">
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div className="divide-y divide-[#EFEADD]">
          {transactions.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F1EBDC] flex items-center justify-center text-[#8A6A2E]">
                  {t.amount > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </div>
                <div>
                  <p className="text-[13px] text-[#1C2B33] font-medium">{t.merchant}</p>
                  <p className="text-[12px] text-[#6B7680]">{t.category} · {t.date}</p>
                </div>
              </div>
              <p className={`text-[13px] font-medium tabular-nums ${t.amount > 0 ? "text-[#1F7A5C]" : "text-[#1C2B33]"}`}>
                {currency(t.amount)}
              </p>
            </div>
          ))}
        </div>
      </LedgerCard>
    </div>
  );
}

function ExpensesPage({ business }) {
  const live = !!(supabase && business);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(live);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    merchant: "", amount: "", date: todayISO(), category: "other",
    payment_method: "Card", notes: "",
  });

  const load = useCallback(async () => {
    if (!live) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setRows(data || []);
    setLoading(false);
  }, [live]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.merchant || !form.amount) { setError("Merchant and amount are required."); return; }
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from("expenses").insert({
      business_id: business.id,
      merchant: form.merchant,
      amount: parseFloat(form.amount),
      date: form.date,
      category: form.category,
      payment_method: form.payment_method,
      notes: form.notes || null,
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    setForm({ merchant: "", amount: "", date: todayISO(), category: "other", payment_method: "Card", notes: "" });
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    setError(null);
    const { error: err } = await supabase.from("expenses").delete().eq("id", id);
    if (err) setError(err.message);
    else setRows((r) => r.filter((x) => x.id !== id));
  };

  // Demo fallback when not logged in / no database
  const demoRows = transactions.filter((t) => t.amount < 0).map((t) => ({
    id: t.id, merchant: t.merchant, category: t.category.toLowerCase(), date: t.date,
    payment_method: t.method, status: t.status, amount: Math.abs(t.amount), _demo: true,
  }));
  const source = live ? rows : demoRows;
  const filtered = source.filter((t) => t.merchant.toLowerCase().includes(query.toLowerCase()));
  const monthTotal = source.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Roboto_Slab'] text-[22px] text-[#1C2B33]">Expenses</h1>
          <p className="text-[13px] text-[#6B7680] mt-0.5">
            {live ? "Saved to your books in real time." : "Demo data — log in to track your own."}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-[#E7E1D4] text-[#1C2B33] text-[13px] font-medium px-3.5 py-2.5 rounded-lg hover:bg-[#F7F3E9] transition-colors">
            <Camera size={15} /> Scan receipt
          </button>
          <button
            onClick={() => live && setShowForm((s) => !s)}
            className="flex items-center gap-2 bg-[#1C2B33] text-white text-[13px] font-medium px-3.5 py-2.5 rounded-lg hover:bg-[#243944] transition-colors disabled:opacity-50"
            disabled={!live}
          >
            <Plus size={15} /> New expense
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#F8E9E4] text-[#B5533C] text-[13px] px-4 py-3 rounded-lg">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {showForm && (
        <LedgerCard className="p-5 pt-6 border-2 !border-[#1C2B33]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-medium text-[#1C2B33]">New expense</h3>
            <button onClick={() => setShowForm(false)} className="text-[#8B9199] hover:text-[#1C2B33]"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-[12px] text-[#6B7680] block mb-1">Merchant</label>
              <input value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })}
                placeholder="Sysco Foods"
                className="w-full text-[13px] border border-[#E7E1D4] rounded-lg px-3 py-2 outline-none bg-white focus:border-[#1C2B33]" />
            </div>
            <div>
              <label className="text-[12px] text-[#6B7680] block mb-1">Amount</label>
              <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^0-9.]/g, "") })}
                placeholder="128.50"
                className="w-full text-[13px] border border-[#E7E1D4] rounded-lg px-3 py-2 outline-none bg-white focus:border-[#1C2B33] tabular-nums" />
            </div>
            <div>
              <label className="text-[12px] text-[#6B7680] block mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full text-[13px] border border-[#E7E1D4] rounded-lg px-3 py-2 outline-none bg-white focus:border-[#1C2B33]" />
            </div>
            <div>
              <label className="text-[12px] text-[#6B7680] block mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full text-[13px] border border-[#E7E1D4] rounded-lg px-3 py-2 outline-none bg-white focus:border-[#1C2B33]">
                {EXPENSE_CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] text-[#6B7680] block mb-1">Payment method</label>
              <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                className="w-full text-[13px] border border-[#E7E1D4] rounded-lg px-3 py-2 outline-none bg-white focus:border-[#1C2B33]">
                {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] text-[#6B7680] block mb-1">Notes (optional)</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Weekly produce order"
                className="w-full text-[13px] border border-[#E7E1D4] rounded-lg px-3 py-2 outline-none bg-white focus:border-[#1C2B33]" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="text-[13px] text-[#6B7680] px-4 py-2 rounded-lg hover:bg-[#F7F3E9]">Cancel</button>
            <button onClick={save} disabled={saving}
              className="text-[13px] font-medium bg-[#1F7A5C] text-white px-4 py-2 rounded-lg hover:bg-[#1A6A50] disabled:opacity-60">
              {saving ? "Saving..." : "Save expense"}
            </button>
          </div>
        </LedgerCard>
      )}

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white border border-[#E7E1D4] rounded-lg px-3 py-2 flex-1 max-w-xs">
          <Search size={15} className="text-[#8B9199]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search merchants"
            className="text-[13px] outline-none bg-transparent w-full placeholder:text-[#8B9199]" />
        </div>
        <span className="text-[13px] text-[#6B7680] ml-auto">
          Total: <span className="font-medium text-[#1C2B33] tabular-nums">{currency(monthTotal)}</span>
        </span>
      </div>

      <LedgerCard className="pt-6 overflow-hidden">
        {loading ? (
          <p className="text-[13px] text-[#6B7680] px-5 py-8 text-center">Loading your expenses...</p>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-[14px] text-[#1C2B33] font-medium mb-1">No expenses yet</p>
            <p className="text-[13px] text-[#6B7680]">Click "New expense" to record your first one.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[12px] text-[#6B7680] border-b border-[#EFEADD]">
                <th className="font-medium px-5 pb-3">Merchant</th>
                <th className="font-medium px-5 pb-3">Category</th>
                <th className="font-medium px-5 pb-3">Method</th>
                <th className="font-medium px-5 pb-3">Date</th>
                <th className="font-medium px-5 pb-3 text-right">Amount</th>
                <th className="px-5 pb-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEADD]">
              {filtered.map((t) => (
                <tr key={t.id} className="text-[13px] hover:bg-[#FBF8F1]">
                  <td className="px-5 py-3 text-[#1C2B33] font-medium">
                    {t.merchant}
                    {t.notes && <span className="block text-[11px] text-[#8B9199] font-normal">{t.notes}</span>}
                  </td>
                  <td className="px-5 py-3"><CategoryChip name={CATEGORY_LABELS[t.category] || t.category} /></td>
                  <td className="px-5 py-3 text-[#6B7680]">{t.payment_method}</td>
                  <td className="px-5 py-3 text-[#6B7680]">{t._demo ? t.date : prettyDate(t.date)}</td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums text-[#1C2B33]">{currency(Number(t.amount))}</td>
                  <td className="px-5 py-3 text-right">
                    {live && (
                      <button onClick={() => remove(t.id)} title="Delete" className="text-[#C6BFB0] hover:text-[#B5533C]">
                        <X size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </LedgerCard>
    </div>
  );
}

function InvoicesPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Roboto_Slab'] text-[22px] text-[#1C2B33]">Invoices</h1>
          <p className="text-[13px] text-[#6B7680] mt-0.5">Send invoices and keep tabs on who owes what.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1C2B33] text-white text-[13px] font-medium px-3.5 py-2.5 rounded-lg hover:bg-[#243944] transition-colors">
          <Plus size={15} /> New invoice
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <LedgerCard className="p-4 pt-5">
          <p className="text-[12px] text-[#6B7680]">Total outstanding</p>
          <p className="font-['Roboto_Slab'] text-xl text-[#1C2B33] mt-1">$1,745.00</p>
        </LedgerCard>
        <LedgerCard className="p-4 pt-5">
          <p className="text-[12px] text-[#6B7680]">Overdue</p>
          <p className="font-['Roboto_Slab'] text-xl text-[#B5533C] mt-1">$1,595.50</p>
        </LedgerCard>
        <LedgerCard className="p-4 pt-5">
          <p className="text-[12px] text-[#6B7680]">Paid this month</p>
          <p className="font-['Roboto_Slab'] text-xl text-[#1F7A5C] mt-1">$1,250.00</p>
        </LedgerCard>
        <LedgerCard className="p-4 pt-5">
          <p className="text-[12px] text-[#6B7680]">Avg. days to pay</p>
          <p className="font-['Roboto_Slab'] text-xl text-[#1C2B33] mt-1">9 days</p>
        </LedgerCard>
      </div>

      <LedgerCard className="pt-6 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[12px] text-[#6B7680] border-b border-[#EFEADD]">
              <th className="font-medium px-5 pb-3">Invoice</th>
              <th className="font-medium px-5 pb-3">Customer</th>
              <th className="font-medium px-5 pb-3">Due date</th>
              <th className="font-medium px-5 pb-3">Status</th>
              <th className="font-medium px-5 pb-3 text-right">Amount</th>
              <th className="px-5 pb-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFEADD]">
            {invoices.map((inv) => (
              <tr key={inv.id} className="text-[13px] hover:bg-[#FBF8F1]">
                <td className="px-5 py-3 text-[#1C2B33] font-medium">{inv.id}</td>
                <td className="px-5 py-3 text-[#6B7680]">{inv.customer}</td>
                <td className="px-5 py-3 text-[#6B7680]">{inv.due}</td>
                <td className="px-5 py-3"><StatusPill status={inv.status} /></td>
                <td className="px-5 py-3 text-right font-medium tabular-nums text-[#1C2B33]">{currency(inv.amount)}</td>
                <td className="px-5 py-3 text-right">
                  <button className="text-[#8B9199] hover:text-[#1C2B33]"><MoreHorizontal size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </LedgerCard>
    </div>
  );
}

function RevenuePage() {
  const [income, setIncome] = useState(initialIncome);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ source: "", desc: "", amount: "", method: "Cash" });
  const [saved, setSaved] = useState(false);

  const total = income.reduce((s, i) => s + i.amount, 0);
  const posTotal = income.filter((i) => i.type === "POS import").reduce((s, i) => s + i.amount, 0);

  const save = () => {
    if (!form.source || !form.amount) return;
    setIncome([
      {
        id: Date.now(),
        source: form.source,
        desc: form.desc || "Income",
        amount: parseFloat(form.amount) || 0,
        date: "Jul 9",
        method: form.method,
        type: "Manual entry",
        status: "Cleared",
      },
      ...income,
    ]);
    setForm({ source: "", desc: "", amount: "", method: "Cash" });
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Roboto_Slab'] text-[22px] text-[#1C2B33]">Revenue</h1>
          <p className="text-[13px] text-[#6B7680] mt-0.5">Every dollar in — from invoices, the register, and everything in between.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#1C2B33] text-white text-[13px] font-medium px-3.5 py-2.5 rounded-lg hover:bg-[#243944] transition-colors"
        >
          <Plus size={15} /> Record income
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-[#E8F3EC] text-[#1F7A5C] text-[13px] font-medium px-4 py-3 rounded-lg">
          <Check size={15} /> Income recorded
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <LedgerCard className="p-4 pt-5">
          <p className="text-[12px] text-[#6B7680]">Total this month</p>
          <p className="font-['Roboto_Slab'] text-xl text-[#1F7A5C] mt-1 tabular-nums">{currency(total)}</p>
        </LedgerCard>
        <LedgerCard className="p-4 pt-5">
          <p className="text-[12px] text-[#6B7680]">From Square POS</p>
          <p className="font-['Roboto_Slab'] text-xl text-[#1C2B33] mt-1 tabular-nums">{currency(posTotal)}</p>
        </LedgerCard>
        <LedgerCard className="p-4 pt-5">
          <p className="text-[12px] text-[#6B7680]">Awaiting invoice payment</p>
          <p className="font-['Roboto_Slab'] text-xl text-[#9C7A2E] mt-1 tabular-nums">$1,745.00</p>
        </LedgerCard>
      </div>

      <LedgerCard className="p-4 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F1EBDC] flex items-center justify-center text-[#8A6A2E]">
            <Building2 size={16} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#1C2B33]">Connected sources</p>
            <p className="text-[12px] text-[#6B7680]">Square POS · Chase Business Checking — deposits import automatically</p>
          </div>
        </div>
        <button className="text-[13px] text-[#8A6A2E] font-medium hover:underline">Manage</button>
      </LedgerCard>

      {showForm && (
        <LedgerCard className="p-5 pt-6 border-2 !border-[#1C2B33]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-medium text-[#1C2B33]">Record income</h3>
            <button onClick={() => setShowForm(false)} className="text-[#8B9199] hover:text-[#1C2B33]"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[12px] text-[#6B7680] block mb-1">Customer / source</label>
              <input
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="Corner Bistro"
                className="w-full text-[13px] border border-[#E7E1D4] rounded-lg px-3 py-2 outline-none bg-white focus:border-[#1C2B33]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#6B7680] block mb-1">Amount</label>
              <input
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^0-9.]/g, "") })}
                placeholder="480.00"
                className="w-full text-[13px] border border-[#E7E1D4] rounded-lg px-3 py-2 outline-none bg-white focus:border-[#1C2B33] tabular-nums"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#6B7680] block mb-1">Description</label>
              <input
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                placeholder="Weekend catering job"
                className="w-full text-[13px] border border-[#E7E1D4] rounded-lg px-3 py-2 outline-none bg-white focus:border-[#1C2B33]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#6B7680] block mb-1">Payment method</label>
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="w-full text-[13px] border border-[#E7E1D4] rounded-lg px-3 py-2 outline-none bg-white focus:border-[#1C2B33]"
              >
                {["Cash", "Card", "ACH", "Check", "Venmo", "Zelle"].map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="text-[13px] text-[#6B7680] px-4 py-2 rounded-lg hover:bg-[#F7F3E9]">Cancel</button>
            <button onClick={save} className="text-[13px] font-medium bg-[#1F7A5C] text-white px-4 py-2 rounded-lg hover:bg-[#1A6A50]">Save income</button>
          </div>
        </LedgerCard>
      )}

      <LedgerCard className="pt-6 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[12px] text-[#6B7680] border-b border-[#EFEADD]">
              <th className="font-medium px-5 pb-3">Source</th>
              <th className="font-medium px-5 pb-3">Description</th>
              <th className="font-medium px-5 pb-3">How it got here</th>
              <th className="font-medium px-5 pb-3">Method</th>
              <th className="font-medium px-5 pb-3">Date</th>
              <th className="font-medium px-5 pb-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFEADD]">
            {income.map((r) => (
              <tr key={r.id} className="text-[13px] hover:bg-[#FBF8F1]">
                <td className="px-5 py-3 text-[#1C2B33] font-medium">{r.source}</td>
                <td className="px-5 py-3 text-[#6B7680]">{r.desc}</td>
                <td className="px-5 py-3">
                  <span className="text-[11px] font-medium bg-[#F1EBDC] text-[#8A6A2E] px-2 py-0.5 rounded-full">{r.type}</span>
                </td>
                <td className="px-5 py-3 text-[#6B7680]">{r.method}</td>
                <td className="px-5 py-3 text-[#6B7680]">{r.date}</td>
                <td className="px-5 py-3 text-right font-medium tabular-nums text-[#1F7A5C]">{currency(r.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </LedgerCard>
    </div>
  );
}

function CustomersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Roboto_Slab'] text-[22px] text-[#1C2B33]">Customers</h1>
          <p className="text-[13px] text-[#6B7680] mt-0.5">Everyone who keeps the lights on.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1C2B33] text-white text-[13px] font-medium px-3.5 py-2.5 rounded-lg hover:bg-[#243944] transition-colors">
          <Plus size={15} /> New customer
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {customers.map((c, ci) => {
          const av = [ACCENTS.green, ACCENTS.plum, ACCENTS.teal, ACCENTS.gold][ci % 4];
          return (
          <LedgerCard key={c.name} className="p-5 pt-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[14px] font-medium text-[#1C2B33]">{c.name}</p>
                <p className="text-[12px] text-[#6B7680]">{c.company}</p>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium" style={{ background: av.chip, color: av.icon }}>
                {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#EFEADD] text-center">
              <div>
                <p className="text-[15px] font-medium text-[#1C2B33] tabular-nums">{currency(c.revenue)}</p>
                <p className="text-[11px] text-[#6B7680]">Revenue</p>
              </div>
              <div>
                <p className="text-[15px] font-medium text-[#1C2B33] tabular-nums">{c.invoices}</p>
                <p className="text-[11px] text-[#6B7680]">Invoices</p>
              </div>
              <div>
                <p className="text-[15px] font-medium text-[#1C2B33]">{c.lastPaid}</p>
                <p className="text-[11px] text-[#6B7680]">Last paid</p>
              </div>
            </div>
          </LedgerCard>
          );
        })}
      </div>
    </div>
  );
}

function ReportsPage() {
  const reports = [
    "Profit & loss", "Income statement", "Expense report", "Revenue report",
    "Cash flow statement", "Monthly summary", "Yearly summary", "Top expense categories",
  ];
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-['Roboto_Slab'] text-[22px] text-[#1C2B33]">Reports</h1>
        <p className="text-[13px] text-[#6B7680] mt-0.5">Generated straight from your books, ready to export.</p>
      </div>
      <LedgerCard className="p-5 pt-6">
        <h3 className="text-[14px] font-medium text-[#1C2B33] mb-4">Monthly profit trend</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueExpenseData.map((d) => ({ month: d.month, profit: d.revenue - d.expenses }))}>
              <CartesianGrid vertical={false} stroke="#EDE7D9" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#6B7680", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6B7680", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v) => currency(v)} contentStyle={{ borderRadius: 8, border: "1px solid #E7E1D4", fontSize: 12 }} />
              <Line type="monotone" dataKey="profit" stroke="#1F7A5C" strokeWidth={2} dot={{ r: 3, fill: "#1F7A5C" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </LedgerCard>
      <div className="grid grid-cols-2 gap-3">
        {reports.map((r) => (
          <LedgerCard key={r} className="p-4 pt-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F1EBDC] flex items-center justify-center text-[#8A6A2E]">
                <FileText size={15} />
              </div>
              <span className="text-[13px] text-[#1C2B33] font-medium">{r}</span>
            </div>
            <button className="text-[#6B7680] hover:text-[#1C2B33]"><Download size={15} /></button>
          </LedgerCard>
        ))}
      </div>
    </div>
  );
}

function AdvisorPage() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi Dana — I've looked at Maple & Thyme's books through July 8th. Profit is up 21% from last month, mostly thanks to the Green Leaf Market contract. Ask me anything, or tap a question below." },
  ]);
  const suggestions = [
    "Why was my profit lower last month?",
    "How can I improve cash flow?",
    "What are my biggest expenses?",
    "Should I raise prices?",
  ];
  const respond = (q) => {
    setMessages((m) => [...m, { role: "user", text: q }]);
    setTimeout(() => {
      let text = "Let me pull that from your ledger.";
      if (q.includes("profit"))
        text = "Back in May, a one-time equipment repair ($640) and a slower catering week pulled profit down about 12%. Everything's since recovered — June and July are both trending up.";
      else if (q.includes("cash flow"))
        text = "Two invoices are overdue totaling $1,595.50 — Green Leaf Market and Westside Diner. Following up on those would be the fastest lever. I can also flag that rent and payroll both land in the first week of the month, which is when your balance runs tightest.";
      else if (q.includes("biggest expenses"))
        text = "Inventory ($2,400) and rent ($1,800) are your top two this month, together about 59% of total spend. Inventory is up 8% versus your 3-month average.";
      else if (q.includes("raise prices"))
        text = "Your margin is 44.4%, up from 38% three months ago, so you're not under immediate pressure. If catering demand keeps outpacing your current capacity, a 5–8% increase on catering packages specifically (not everyday menu items) would track with what similar local kitchens have done.";
      setMessages((m) => [...m, { role: "ai", text }]);
    }, 500);
  };
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-['Roboto_Slab'] text-[22px] text-[#1C2B33] flex items-center gap-2">
          <Sparkles size={20} className="text-[#8A6A2E]" /> AI Advisor
        </h1>
        <p className="text-[13px] text-[#6B7680] mt-0.5">Your virtual CFO — grounded in your actual numbers.</p>
      </div>
      <LedgerCard className="p-5 pt-6 min-h-[420px] flex flex-col">
        <div className="flex-1 space-y-4 mb-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-[13px] leading-relaxed ${
                m.role === "user" ? "bg-[#1C2B33] text-white" : "bg-[#F7F3E9] text-[#1C2B33]"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => respond(s)}
              className="text-[12px] text-[#8A6A2E] bg-[#F1EBDC] px-3 py-1.5 rounded-full hover:bg-[#E9DFC5] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#E7E1D4] rounded-lg px-3 py-2.5">
          <input placeholder="Ask about your finances..." className="flex-1 text-[13px] outline-none bg-transparent placeholder:text-[#8B9199]" />
          <button className="text-[#8A6A2E]"><Send size={16} /></button>
        </div>
      </LedgerCard>
    </div>
  );
}

function BillingPage({ subscribed, onSubscribe }) {
  const [checkout, setCheckout] = useState(false);
  const [card, setCard] = useState({ number: "", exp: "", cvc: "" });
  const [paying, setPaying] = useState(false);

  const pay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setCheckout(false);
      onSubscribe();
    }, 1200);
  };

  const features = [
    "Unlimited transactions & invoices",
    "AI Advisor with full financial context",
    "Receipt scanning & auto-categorization",
    "All reports, exported anytime",
    "Bank-level encryption & backups",
    "Email support, 1 business day",
  ];

  // ---------- Not subscribed: pricing + checkout ----------
  if (!subscribed) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="font-['Roboto_Slab'] text-[22px] text-[#1C2B33]">Billing</h1>
          <p className="text-[13px] text-[#6B7680] mt-0.5">One plan. Everything included. No surprises.</p>
        </div>

        {!checkout ? (
          <LedgerCard className="p-7 pt-8 border-2 !border-[#D4A24C]">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-['Roboto_Slab'] text-lg text-[#1C2B33]">ProfitPilot for your business</h3>
              <span className="text-[11px] font-semibold bg-[#FBF2E2] text-[#9C7A2E] px-2.5 py-1 rounded-full">Free trial · 5 days left</span>
            </div>
            <p className="text-[13px] text-[#6B7680] mb-5">Built for one shop, one truck, one studio — not a finance department.</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-['Roboto_Slab'] text-4xl text-[#1C2B33]">$20</span>
              <span className="text-[13px] text-[#6B7680]">/ month · cancel anytime</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-6">
              {features.map((f) => (
                <div key={f} className="flex items-start gap-2 text-[13px] text-[#1C2B33]">
                  <Check size={15} className="text-[#1F7A5C] mt-0.5 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <button
              onClick={() => setCheckout(true)}
              className="w-full bg-[#1C2B33] text-white text-[14px] font-medium py-3 rounded-lg hover:bg-[#243944] transition-colors"
            >
              Subscribe — $20/month
            </button>
            <p className="text-[11px] text-[#8B9199] text-center mt-3">Secure checkout powered by Stripe. No contracts, cancel in one click.</p>
          </LedgerCard>
        ) : (
          <LedgerCard className="p-7 pt-8 border-2 !border-[#1C2B33]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-['Roboto_Slab'] text-lg text-[#1C2B33]">Checkout</h3>
              <button onClick={() => setCheckout(false)} className="text-[#8B9199] hover:text-[#1C2B33]"><X size={16} /></button>
            </div>
            <div className="flex items-center justify-between bg-[#F7F3E9] rounded-lg px-4 py-3 mb-5 text-[13px]">
              <span className="text-[#1C2B33] font-medium">ProfitPilot monthly</span>
              <span className="text-[#1C2B33] font-medium tabular-nums">$20.00 / mo</span>
            </div>
            <div className="space-y-3.5 mb-5">
              <div>
                <label className="text-[12px] text-[#6B7680] block mb-1.5">Card number</label>
                <input
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: e.target.value })}
                  placeholder="4242 4242 4242 4242"
                  className="w-full text-[14px] border border-[#E7E1D4] rounded-lg px-3.5 py-2.5 outline-none bg-white focus:border-[#1C2B33] tabular-nums"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] text-[#6B7680] block mb-1.5">Expiry</label>
                  <input
                    value={card.exp}
                    onChange={(e) => setCard({ ...card, exp: e.target.value })}
                    placeholder="12 / 28"
                    className="w-full text-[14px] border border-[#E7E1D4] rounded-lg px-3.5 py-2.5 outline-none bg-white focus:border-[#1C2B33] tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-[#6B7680] block mb-1.5">CVC</label>
                  <input
                    value={card.cvc}
                    onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                    placeholder="123"
                    className="w-full text-[14px] border border-[#E7E1D4] rounded-lg px-3.5 py-2.5 outline-none bg-white focus:border-[#1C2B33] tabular-nums"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={pay}
              disabled={paying}
              className="w-full bg-[#1F7A5C] text-white text-[14px] font-medium py-3 rounded-lg hover:bg-[#1A6A50] transition-colors disabled:opacity-60"
            >
              {paying ? "Processing..." : "Pay $20.00"}
            </button>
            <p className="text-[11px] text-[#8B9199] text-center mt-3">This is a demo — any numbers work. Real version uses Stripe.</p>
          </LedgerCard>
        )}
      </div>
    );
  }

  // ---------- Subscribed: active plan ----------
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-['Roboto_Slab'] text-[22px] text-[#1C2B33]">Billing</h1>
        <p className="text-[13px] text-[#6B7680] mt-0.5">One plan. Everything included. No surprises.</p>
      </div>

      <div className="flex items-center gap-2 bg-[#E8F3EC] text-[#1F7A5C] text-[13px] font-medium px-4 py-3 rounded-lg">
        <Check size={15} /> You're subscribed — everything is unlocked. Welcome aboard!
      </div>

      <LedgerCard className="p-7 pt-8 border-2 !border-[#1C2B33]">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-['Roboto_Slab'] text-lg text-[#1C2B33]">ProfitPilot for your business</h3>
          <span className="text-[11px] font-semibold bg-[#1C2B33] text-white px-2.5 py-1 rounded-full">Active</span>
        </div>
        <p className="text-[13px] text-[#6B7680] mb-5">Built for one shop, one truck, one studio — not a finance department.</p>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="font-['Roboto_Slab'] text-4xl text-[#1C2B33]">$20</span>
          <span className="text-[13px] text-[#6B7680]">/ month, billed monthly</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-6">
          {features.map((f) => (
            <div key={f} className="flex items-start gap-2 text-[13px] text-[#1C2B33]">
              <Check size={15} className="text-[#1F7A5C] mt-0.5 shrink-0" />
              {f}
            </div>
          ))}
        </div>
        <div className="h-px bg-[repeating-linear-gradient(to_right,#D8D0BC_0,#D8D0BC_4px,transparent_4px,transparent_8px)] mb-5" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] text-[#6B7680]">
            <CreditCard size={15} /> Visa •••• 4242 · renews Aug 9
          </div>
          <div className="flex gap-4">
            <button className="text-[13px] text-[#8A6A2E] font-medium hover:underline">Update card</button>
            <button className="text-[13px] text-[#8B9199] font-medium hover:underline">Cancel plan</button>
          </div>
        </div>
      </LedgerCard>

      <LedgerCard className="p-5 pt-6">
        <h3 className="text-[14px] font-medium text-[#1C2B33] mb-3">Billing history</h3>
        <div className="divide-y divide-[#EFEADD]">
          {["Jul 9, 2026"].map((d) => (
            <div key={d} className="flex items-center justify-between py-2.5 text-[13px]">
              <span className="text-[#1C2B33]">{d}</span>
              <span className="text-[#6B7680]">$20.00</span>
              <button className="text-[#8A6A2E] font-medium hover:underline">Download receipt</button>
            </div>
          ))}
        </div>
      </LedgerCard>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h1 className="font-['Roboto_Slab'] text-[22px] text-[#1C2B33]">Settings</h1>
        <p className="text-[13px] text-[#6B7680] mt-0.5">Business details and preferences.</p>
      </div>
      <LedgerCard className="p-5 pt-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-[#EFEADD]">
          <div className="w-12 h-12 rounded-lg bg-[#F1EBDC] flex items-center justify-center text-[#8A6A2E]">
            <Store size={20} />
          </div>
          <div>
            <p className="text-[14px] font-medium text-[#1C2B33]">Maple & Thyme Kitchen</p>
            <p className="text-[12px] text-[#6B7680]">Restaurant & catering · San Ramon, CA</p>
          </div>
        </div>
        {[
          ["Business name", "Maple & Thyme Kitchen"],
          ["Tax rate", "8.75%"],
          ["Currency", "USD ($)"],
          ["Time zone", "Pacific Time (US)"],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-[13px]">
            <span className="text-[#6B7680]">{label}</span>
            <span className="text-[#1C2B33] font-medium">{value}</span>
          </div>
        ))}
      </LedgerCard>
      <LedgerCard className="p-5 pt-6 space-y-3">
        <h3 className="text-[14px] font-medium text-[#1C2B33] mb-1">Notifications</h3>
        {["Overdue invoices", "Large expenses", "Monthly report ready", "Cash flow warnings"].map((n) => (
          <div key={n} className="flex items-center justify-between text-[13px]">
            <span className="text-[#1C2B33]">{n}</span>
            <div className="w-9 h-5 rounded-full bg-[#1F7A5C] relative">
              <div className="w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] right-[3px]" />
            </div>
          </div>
        ))}
      </LedgerCard>
    </div>
  );
}

// ---------- Landing page (the "outside") ----------

function LandingPage({ onEnter }) {
  const features = [
    { icon: Camera, title: "Snap a receipt, done", desc: "Take a photo — ProfitPilot reads the merchant, amount, tax, and files it in the right category.", a: ACCENTS.green },
    { icon: FileText, title: "Invoices that chase themselves", desc: "Send professional invoices and let automatic reminders nudge late payers, so you don't have to.", a: ACCENTS.gold },
    { icon: Sparkles, title: "A CFO in your pocket", desc: "Ask \"why was profit down?\" or \"can I afford a new espresso machine?\" — answered from your real numbers.", a: ACCENTS.plum },
    { icon: BarChart3, title: "Tax time in one click", desc: "Profit & loss, expense reports, and everything your accountant asks for — exported in seconds.", a: ACCENTS.teal },
    { icon: Zap, title: "Ten minutes a week", desc: "Confirm imported transactions, snap receipts, send an invoice. That's your whole bookkeeping routine.", a: ACCENTS.rust },
    { icon: ShieldCheck, title: "Your books, locked down", desc: "Bank-level encryption, and your data is never sold or shared. It's your business — literally.", a: ACCENTS.ink },
  ];
  const testimonials = [
    { name: "Rosa M.", biz: "Taquería owner", quote: "I used to do my books at midnight with a shoebox of receipts. Now I do them in line at the bank.", icon: Store },
    { name: "Devon K.", biz: "Mobile mechanic", quote: "The AI caught that my parts supplier raised prices 12%. Paid for the year right there.", icon: Wrench },
    { name: "Priya S.", biz: "Salon owner", quote: "I finally know what I actually make each month. Not what I think — what I make.", icon: Scissors },
  ];
  const steps = [
    { n: "1", title: "Sign up in a minute", desc: "Name your business, set your tax rate. No accounting knowledge needed." },
    { n: "2", title: "Add money in & out", desc: "Send invoices, snap receipts, record cash days. Everything lands in one tidy ledger." },
    { n: "3", title: "See where you stand", desc: "Profit, cash, and what's owed to you — always current, always one glance away." },
  ];

  return (
    <div className="min-h-screen bg-[#FBF8F3] font-['Inter'] overflow-y-auto">
      {/* Nav */}
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#D4A24C] flex items-center justify-center">
            <span className="font-['Roboto_Slab'] text-[14px] text-[#1C2B33] font-semibold">P</span>
          </div>
          <span className="font-['Roboto_Slab'] text-[17px] text-[#1C2B33]">ProfitPilot</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onEnter} className="text-[13px] text-[#1C2B33] font-medium hover:underline">Log in</button>
          <button onClick={onEnter} className="bg-[#1C2B33] text-white text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-[#243944] transition-colors">
            Start free trial
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-16 text-center">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#8A6A2E] bg-[#F5EBD5] px-3 py-1.5 rounded-full mb-6">
          <Sparkles size={13} /> Bookkeeping with AI built in — made for local businesses
        </span>
        <h1 className="font-['Roboto_Slab'] text-[42px] leading-[1.15] text-[#1C2B33] max-w-2xl mx-auto">
          Know exactly where your money's going — in <span className="text-[#1F7A5C]">ten minutes a week</span>
        </h1>
        <p className="text-[16px] text-[#6B7680] max-w-xl mx-auto mt-5 leading-relaxed">
          ProfitPilot is bookkeeping for the shop, the truck, the studio, the stall — not for accountants.
          Snap receipts, send invoices, and ask your books questions in plain English.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <button onClick={onEnter} className="flex items-center gap-2 bg-[#1C2B33] text-white text-[14px] font-medium px-6 py-3.5 rounded-lg hover:bg-[#243944] transition-colors">
            Try it free for 7 days <ArrowRight size={16} />
          </button>
          <button onClick={onEnter} className="text-[14px] text-[#1C2B33] font-medium px-6 py-3.5 rounded-lg border border-[#E7E1D4] bg-white hover:bg-[#F7F3E9] transition-colors">
            See the demo
          </button>
        </div>
        <p className="text-[12px] text-[#8B9199] mt-4">No credit card to start · $20/month after · cancel anytime</p>

        {/* Mini dashboard preview */}
        <div className="relative mt-14 rounded-2xl p-6 text-left" style={{ background: "linear-gradient(115deg, #1C2B33 0%, #24404A 55%, #2E5A54 100%)" }}>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Revenue this month", val: "$12,850", delta: "+14.7%", up: true },
              { label: "Net profit", val: "$5,700", delta: "+21.3%", up: true },
              { label: "Owed to you", val: "$1,745", delta: "2 overdue", up: false },
            ].map((k) => (
              <div key={k.label} className="bg-[#FFFDF9] rounded-xl p-4">
                <p className="text-[12px] text-[#6B7680]">{k.label}</p>
                <p className="font-['Roboto_Slab'] text-[22px] text-[#1C2B33] tabular-nums mt-0.5">{k.val}</p>
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full mt-1.5 ${k.up ? "bg-[#E8F3EC] text-[#1F7A5C]" : "bg-[#F8E9E4] text-[#B5533C]"}`}>
                  {k.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />} {k.delta}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-[#FFFDF9] rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F0E5EC] flex items-center justify-center shrink-0"><Sparkles size={15} className="text-[#7A4E68]" /></div>
            <p className="text-[13px] text-[#1C2B33]">
              <span className="font-medium">Your advisor:</span> "Inventory spend is up 8% vs your average — mostly Sysco. Want me to break it down?"
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="font-['Roboto_Slab'] text-[28px] text-[#1C2B33] text-center mb-3">Everything the back office does — without the back office</h2>
        <p className="text-[14px] text-[#6B7680] text-center max-w-lg mx-auto mb-10">You didn't open a business to do bookkeeping. ProfitPilot does the boring parts and tells you what matters.</p>
        <div className="grid grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bg-[#FFFDF9] rounded-xl border border-[#E7E1D4] p-5 hover:shadow-[0_4px_12px_rgba(28,43,51,0.06)] transition-shadow">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: f.a.chip }}>
                <f.icon size={18} style={{ color: f.a.icon }} />
              </div>
              <h3 className="text-[14px] font-medium text-[#1C2B33] mb-1.5">{f.title}</h3>
              <p className="text-[13px] text-[#6B7680] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#1C2B33] py-14">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-['Roboto_Slab'] text-[28px] text-[#FBF8F3] text-center mb-10">Up and running before your coffee's cold</h2>
          <div className="grid grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-11 h-11 rounded-full bg-[#D4A24C] flex items-center justify-center mx-auto mb-4">
                  <span className="font-['Roboto_Slab'] text-[16px] text-[#1C2B33] font-semibold">{s.n}</span>
                </div>
                <h3 className="text-[15px] font-medium text-[#FBF8F3] mb-1.5">{s.title}</h3>
                <p className="text-[13px] text-[#AEBBC2] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="font-['Roboto_Slab'] text-[28px] text-[#1C2B33] text-center mb-10">Built for businesses like yours</h2>
        <div className="grid grid-cols-3 gap-4">
          {testimonials.map((t, i) => {
            const a = [ACCENTS.rust, ACCENTS.teal, ACCENTS.plum][i];
            return (
              <div key={t.name} className="bg-[#FFFDF9] rounded-xl border border-[#E7E1D4] p-5">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, s) => <Star key={s} size={13} className="text-[#D4A24C] fill-[#D4A24C]" />)}
                </div>
                <p className="text-[13px] text-[#1C2B33] leading-relaxed mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-2.5 pt-3 border-t border-[#EFEADD]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: a.chip }}>
                    <t.icon size={14} style={{ color: a.icon }} />
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-[#1C2B33]">{t.name}</p>
                    <p className="text-[11px] text-[#6B7680]">{t.biz}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-[#B0B6BC] text-center mt-4">Illustrative examples for demo purposes</p>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="max-w-lg mx-auto relative bg-[#FFFDF9] rounded-2xl border-2 border-[#1C2B33] p-8 text-center shadow-[0_8px_24px_rgba(28,43,51,0.08)]">
          <span className="inline-block text-[11px] font-semibold bg-[#D4A24C] text-[#1C2B33] px-3 py-1 rounded-full mb-4">ONE PLAN. EVERYTHING INCLUDED.</span>
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="font-['Roboto_Slab'] text-[52px] text-[#1C2B33]">$20</span>
            <span className="text-[14px] text-[#6B7680]">/month</span>
          </div>
          <p className="text-[13px] text-[#6B7680] mb-6">Less than one hour of a bookkeeper's time.</p>
          <div className="text-left space-y-2.5 max-w-xs mx-auto mb-7">
            {["Unlimited invoices & transactions", "AI advisor + receipt scanning", "Every report your accountant needs", "7-day free trial, cancel anytime"].map((f) => (
              <div key={f} className="flex items-start gap-2 text-[13px] text-[#1C2B33]">
                <Check size={15} className="text-[#1F7A5C] mt-0.5 shrink-0" /> {f}
              </div>
            ))}
          </div>
          <button onClick={onEnter} className="w-full bg-[#1C2B33] text-white text-[14px] font-medium py-3.5 rounded-lg hover:bg-[#243944] transition-colors">
            Start your free trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E7E1D4] py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#D4A24C] flex items-center justify-center">
              <span className="font-['Roboto_Slab'] text-[11px] text-[#1C2B33] font-semibold">P</span>
            </div>
            <span className="text-[13px] text-[#6B7680]">ProfitPilot © 2026</span>
          </div>
          <div className="flex gap-5 text-[12px] text-[#8B9199]">
            <span>Terms</span><span>Privacy</span><span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---------- App shell ----------

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "revenue", label: "Revenue", icon: DollarSign },
  { key: "expenses", label: "Expenses", icon: Receipt },
  { key: "invoices", label: "Invoices", icon: FileText, badge: 2 },
  { key: "customers", label: "Customers", icon: Users },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "advisor", label: "AI Advisor", icon: Sparkles },
];

export default function ProfitPilot({ session, onSignOut }) {
  const userEmail = session?.user?.email || "you@yourbusiness.com";
  const initials = userEmail.slice(0, 2).toUpperCase();
  const [view, setView] = useState(session ? "app" : "landing");
  const [page, setPage] = useState("dashboard");
  const [subscribed, setSubscribed] = useState(false);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    if (!supabase || !session) return;
    (async () => {
      const { data } = await supabase.from("businesses").select("*").limit(1);
      if (data && data.length) { setBusiness(data[0]); return; }
      const { data: created } = await supabase
        .from("businesses")
        .insert({ owner_id: session.user.id, name: "My business" })
        .select();
      if (created && created.length) setBusiness(created[0]);
    })();
  }, [session]);

  const content = useMemo(() => {
    switch (page) {
      case "dashboard": return <DashboardPage />;
      case "revenue": return <RevenuePage />;
      case "expenses": return <ExpensesPage business={business} />;
      case "invoices": return <InvoicesPage />;
      case "customers": return <CustomersPage />;
      case "reports": return <ReportsPage />;
      case "advisor": return <AdvisorPage />;
      case "billing": return <BillingPage subscribed={subscribed} onSubscribe={() => setSubscribed(true)} />;
      case "settings": return <SettingsPage />;
      default: return <DashboardPage />;
    }
  }, [page, subscribed, business]);

  if (view === "landing") return <LandingPage onEnter={() => setView("app")} />;

  return (
    <div className="flex h-screen bg-[#FBF8F3] font-['Inter'] overflow-hidden">
      {/* Sidebar */}
      <div className="w-60 bg-[#1C2B33] flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="w-7 h-7 rounded-md bg-[#D4A24C] flex items-center justify-center">
            <span className="font-['Roboto_Slab'] text-[13px] text-[#1C2B33] font-semibold">P</span>
          </div>
          <span className="font-['Roboto_Slab'] text-[15px] text-[#FBF8F3]">ProfitPilot</span>
        </div>
        <div className="px-3 space-y-0.5 flex-1">
          {NAV.map((item) => (
            <SidebarItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              active={page === item.key}
              onClick={() => setPage(item.key)}
            />
          ))}
        </div>
        <div className="px-3 pb-3 space-y-0.5 border-t border-[#2A3B44] pt-3 mx-3">
          <SidebarItem icon={Settings} label="Settings" active={page === "settings"} onClick={() => setPage("settings")} />
          <SidebarItem icon={CreditCard} label="Billing" active={page === "billing"} onClick={() => setPage("billing")} />
        </div>
        <div className="mx-3 mb-4 mt-1 p-3 rounded-lg bg-[#243944] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#D4A24C] flex items-center justify-center text-[#1C2B33] text-[12px] font-semibold shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-[#FBF8F3] font-medium truncate">{userEmail}</p>
            <p className="text-[11px] text-[#8B9AA3] truncate">Owner</p>
          </div>
          {onSignOut && (
            <button onClick={onSignOut} title="Sign out" className="text-[#8B9AA3] hover:text-[#FBF8F3] shrink-0">
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 border-b border-[#E7E1D4] flex items-center justify-between px-6 shrink-0 bg-[#FBF8F3]">
          <div className="flex items-center gap-2 bg-white border border-[#E7E1D4] rounded-lg px-3 py-1.5 w-72">
            <Search size={14} className="text-[#8B9199]" />
            <input placeholder="Search transactions, invoices..." className="text-[13px] outline-none bg-transparent w-full placeholder:text-[#8B9199]" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setView("landing")} className="text-[12px] text-[#8B9199] hover:text-[#1C2B33] font-medium">
              ← View site
            </button>
            <button className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F1EBDC] text-[#6B7680]">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#B5533C]" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {!subscribed && page !== "billing" && (
            <div className="flex items-center justify-between bg-[#1C2B33] text-white rounded-xl px-5 py-3.5 mb-6">
              <div className="flex items-center gap-2.5 text-[13px]">
                <AlertCircle size={16} className="text-[#D4A24C]" />
                <span><span className="font-medium">Free trial — 5 days left.</span> Subscribe to keep your books running after the trial.</span>
              </div>
              <button
                onClick={() => setPage("billing")}
                className="bg-[#D4A24C] text-[#1C2B33] text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#C7963E] transition-colors shrink-0"
              >
                Subscribe — $20/mo
              </button>
            </div>
          )}
          {content}
        </div>
      </div>
    </div>
  );
}
