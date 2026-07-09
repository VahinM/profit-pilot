import React, { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  LayoutDashboard, Receipt, FileText, Users, BarChart3, Sparkles,
  Settings, CreditCard, Plus, Search, Filter, Download, ChevronRight,
  ArrowUpRight, ArrowDownRight, DollarSign, Wallet, TrendingUp,
  AlertCircle, Check, X, Menu, Bell, Store, Coffee, Wrench, Scissors,
  Send, MoreHorizontal, Camera, Building2
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

function KPICard({ label, value, delta, positive, icon: Icon, sparkline }) {
  return (
    <LedgerCard className="p-5 pt-6">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-[#F1EBDC] flex items-center justify-center">
          <Icon size={17} className="text-[#8A6A2E]" strokeWidth={2} />
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
              <Line type="monotone" dataKey="v" stroke={positive ? "#1F7A5C" : "#B5533C"} strokeWidth={1.75} dot={false} />
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
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors ${
        active ? "bg-[#28394326] bg-[#2A3B44] text-[#FBF8F3]" : "text-[#C8CDD1] hover:bg-[#28394D] hover:text-[#FBF8F3]"
      }`}
      style={active ? { backgroundColor: "#2A3B44" } : {}}
    >
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Roboto_Slab'] text-[22px] text-[#1C2B33]">Good morning, Dana</h1>
          <p className="text-[13px] text-[#6B7680] mt-0.5">Here's how Maple & Thyme Kitchen is doing this month.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1C2B33] text-white text-[13px] font-medium px-4 py-2.5 rounded-lg hover:bg-[#243944] transition-colors">
          <Plus size={16} /> Add expense
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Revenue this month" value="$12,850" delta="+14.7%" positive icon={DollarSign} sparkline={sparkA} />
        <KPICard label="Expenses this month" value="$7,150" delta="+5.2%" positive={false} icon={Receipt} sparkline={sparkB} />
        <KPICard label="Net profit" value="$5,700" delta="+21.3%" positive icon={TrendingUp} sparkline={sparkA} />
        <KPICard label="Cash balance" value="$18,420" delta="+3.1%" positive icon={Wallet} sparkline={sparkB} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <KPICard label="Outstanding invoices" value="$1,745" delta="2 overdue" positive={false} icon={FileText} />
        <KPICard label="Profit margin" value="44.4%" delta="+3.8pt" positive icon={BarChart3} />
        <KPICard label="Upcoming bills" value="$2,040" delta="due in 6 days" positive={false} icon={AlertCircle} />
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

function ExpensesPage() {
  const [query, setQuery] = useState("");
  const filtered = transactions.filter((t) =>
    t.merchant.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Roboto_Slab'] text-[22px] text-[#1C2B33]">Expenses</h1>
          <p className="text-[13px] text-[#6B7680] mt-0.5">Track and categorize every dollar out.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-[#E7E1D4] text-[#1C2B33] text-[13px] font-medium px-3.5 py-2.5 rounded-lg hover:bg-[#F7F3E9] transition-colors">
            <Camera size={15} /> Scan receipt
          </button>
          <button className="flex items-center gap-2 bg-[#1C2B33] text-white text-[13px] font-medium px-3.5 py-2.5 rounded-lg hover:bg-[#243944] transition-colors">
            <Plus size={15} /> New expense
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white border border-[#E7E1D4] rounded-lg px-3 py-2 flex-1 max-w-xs">
          <Search size={15} className="text-[#8B9199]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search merchants"
            className="text-[13px] outline-none bg-transparent w-full placeholder:text-[#8B9199]"
          />
        </div>
        <button className="flex items-center gap-1.5 text-[13px] text-[#1C2B33] border border-[#E7E1D4] bg-white px-3 py-2 rounded-lg hover:bg-[#F7F3E9]">
          <Filter size={14} /> Filter
        </button>
        <button className="flex items-center gap-1.5 text-[13px] text-[#1C2B33] border border-[#E7E1D4] bg-white px-3 py-2 rounded-lg hover:bg-[#F7F3E9] ml-auto">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <LedgerCard className="pt-6 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[12px] text-[#6B7680] border-b border-[#EFEADD]">
              <th className="font-medium px-5 pb-3">Merchant</th>
              <th className="font-medium px-5 pb-3">Category</th>
              <th className="font-medium px-5 pb-3">Method</th>
              <th className="font-medium px-5 pb-3">Date</th>
              <th className="font-medium px-5 pb-3">Status</th>
              <th className="font-medium px-5 pb-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFEADD]">
            {filtered.map((t) => (
              <tr key={t.id} className="text-[13px] hover:bg-[#FBF8F1]">
                <td className="px-5 py-3 text-[#1C2B33] font-medium">{t.merchant}</td>
                <td className="px-5 py-3 text-[#6B7680]">{t.category}</td>
                <td className="px-5 py-3 text-[#6B7680]">{t.method}</td>
                <td className="px-5 py-3 text-[#6B7680]">{t.date}</td>
                <td className="px-5 py-3"><StatusPill status={t.status} /></td>
                <td className={`px-5 py-3 text-right font-medium tabular-nums ${t.amount > 0 ? "text-[#1F7A5C]" : "text-[#1C2B33]"}`}>
                  {currency(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        {customers.map((c) => (
          <LedgerCard key={c.name} className="p-5 pt-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[14px] font-medium text-[#1C2B33]">{c.name}</p>
                <p className="text-[12px] text-[#6B7680]">{c.company}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#F1EBDC] flex items-center justify-center text-[#8A6A2E] text-[13px] font-medium">
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
        ))}
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

function BillingPage() {
  const features = [
    "Unlimited transactions & invoices",
    "AI Advisor with full financial context",
    "Receipt scanning & auto-categorization",
    "All reports, exported anytime",
    "Bank-level encryption & backups",
    "Email support, 1 business day",
  ];
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-['Roboto_Slab'] text-[22px] text-[#1C2B33]">Billing</h1>
        <p className="text-[13px] text-[#6B7680] mt-0.5">One plan. Everything included. No surprises.</p>
      </div>

      <LedgerCard className="p-7 pt-8 border-2 !border-[#1C2B33]">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-['Roboto_Slab'] text-lg text-[#1C2B33]">ProfitPilot for your business</h3>
          <span className="text-[11px] font-semibold bg-[#1C2B33] text-white px-2.5 py-1 rounded-full">Current plan</span>
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
            <CreditCard size={15} /> Visa •••• 4471 · renews Aug 9
          </div>
          <button className="text-[13px] text-[#8A6A2E] font-medium hover:underline">Update payment method</button>
        </div>
      </LedgerCard>

      <LedgerCard className="p-5 pt-6">
        <h3 className="text-[14px] font-medium text-[#1C2B33] mb-3">Billing history</h3>
        <div className="divide-y divide-[#EFEADD]">
          {["Jun 9, 2026", "May 9, 2026", "Apr 9, 2026"].map((d) => (
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

export default function ProfitPilot() {
  const [page, setPage] = useState("dashboard");

  const content = useMemo(() => {
    switch (page) {
      case "dashboard": return <DashboardPage />;
      case "revenue": return <RevenuePage />;
      case "expenses": return <ExpensesPage />;
      case "invoices": return <InvoicesPage />;
      case "customers": return <CustomersPage />;
      case "reports": return <ReportsPage />;
      case "advisor": return <AdvisorPage />;
      case "billing": return <BillingPage />;
      case "settings": return <SettingsPage />;
      default: return <DashboardPage />;
    }
  }, [page]);

  return (
    <div className="flex h-screen bg-[#FBF8F3] font-['Inter'] overflow-hidden">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto+Slab:wght@500;600&display=swap');
      `}</style>

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
            DM
          </div>
          <div className="min-w-0">
            <p className="text-[12px] text-[#FBF8F3] font-medium truncate">Dana Marsh</p>
            <p className="text-[11px] text-[#8B9AA3] truncate">Owner</p>
          </div>
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
            <button className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F1EBDC] text-[#6B7680]">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#B5533C]" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {content}
        </div>
      </div>
    </div>
  );
}
