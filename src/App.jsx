import { useEffect, useMemo, useState } from "react";
import { Plus, FileText, TrendingUp, ArrowUp, ArrowDown } from "react-feather";
import { getInvoices, saveInvoice, deleteInvoice, updateInvoice } from "./db.js";
import InvoiceList from "./components/InvoiceList.jsx";
import InvoiceForm from "./components/InvoiceForm.jsx";
import InvoiceDetail from "./components/InvoiceDetail.jsx";
import MonthFilter from "./components/MonthFilter.jsx";
import PaymentFilterBar from "./components/PaymentFilterBar.jsx";

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const now = new Date();
const currency = (n) => Number(n || 0).toLocaleString(undefined, { style: "currency", currency: "USD" });

// Sums selling price / profit for invoices falling in a given month+year.
function periodTotals(invoices, month, year) {
  const matching = invoices.filter((inv) => {
    const d = new Date(inv.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  return {
    sales: matching.reduce((sum, inv) => sum + Number(inv.sellingPrice || 0), 0),
    profit: matching.reduce((sum, inv) => sum + Number(inv.profit || 0), 0)
  };
}

function percentDelta(current, previous) {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

// Whether an invoice matches the selected payment-status filter chip.
function paymentMatches(inv, paymentFilter) {
  switch (paymentFilter) {
    case "dealerPaid":
      return !!inv.dealerPaid && !inv.commissionPaid;
    case "commissionPaid":
      return !!inv.commissionPaid && !inv.dealerPaid;
    case "bothPaid":
      return !!inv.dealerPaid && !!inv.commissionPaid;
    case "unpaid":
      return !inv.dealerPaid && !inv.commissionPaid;
    default:
      return true;
  }
}

export default function App() {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewingInvoiceId, setViewingInvoiceId] = useState(null);

  // "all" for either field means that dimension isn't filtered.
  const [filter, setFilter] = useState({ month: now.getMonth(), year: now.getFullYear() });
  const [paymentFilter, setPaymentFilter] = useState("all");

  async function refresh() {
    const all = await getInvoices();
    setInvoices(all);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSave(invoice) {
    await saveInvoice(invoice);
    setShowForm(false);
    refresh();
  }

  async function handleDelete(id) {
    await deleteInvoice(id);
    refresh();
  }

  async function handleTogglePayment(id, field, value) {
    await updateInvoice(id, { [field]: value });
    refresh();
  }

  // Derived from the live invoices list (rather than stored as its own
  // object) so it always reflects the latest payment status after a toggle.
  const viewingInvoice = invoices.find((inv) => inv.id === viewingInvoiceId) || null;

  const years = useMemo(() => {
    const set = new Set(invoices.map((inv) => new Date(inv.date).getFullYear()));
    set.add(now.getFullYear());
    return [...set].sort((a, b) => b - a);
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const d = new Date(inv.date);
      const monthOk = filter.month === "all" || d.getMonth() === Number(filter.month);
      const yearOk = filter.year === "all" || d.getFullYear() === Number(filter.year);
      return monthOk && yearOk && paymentMatches(inv, paymentFilter);
    });
  }, [invoices, filter, paymentFilter]);

  const totalSales = filteredInvoices.reduce((sum, inv) => sum + Number(inv.sellingPrice || 0), 0);
  const totalProfit = filteredInvoices.reduce((sum, inv) => sum + Number(inv.profit || 0), 0);

  // Month-over-month comparison only makes sense when a specific month + year
  // is selected (matches a single, well-defined "previous month").
  const deltas = useMemo(() => {
    if (filter.month === "all" || filter.year === "all") return null;
    const month = Number(filter.month);
    const year = Number(filter.year);
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const current = periodTotals(invoices, month, year);
    const previous = periodTotals(invoices, prevMonth, prevYear);
    return {
      sales: percentDelta(current.sales, previous.sales),
      profit: percentDelta(current.profit, previous.profit)
    };
  }, [invoices, filter]);

  const periodLabel =
    filter.month === "all" && filter.year === "all"
      ? "All time"
      : filter.month === "all"
      ? `${filter.year}`
      : filter.year === "all"
      ? MONTH_LABELS[filter.month]
      : `${MONTH_LABELS[filter.month]} ${filter.year}`;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">
            <FileText size={17} />
          </span>
          <span className="brand-name">Invoice Ledger</span>
        </div>
        <button className="btn-create" onClick={() => setShowForm(true)} aria-label="Create invoice">
          <Plus size={20} />
        </button>
      </header>

      <main className="content">
        <section className="page-intro">
          <h1>Sales overview</h1>
          <p>Track every invoice, sale and margin in one place.</p>
        </section>

        <section className="summary-cards">
          <div className="stat-card stat-card-dark">
            <div className="stat-top">
              <span className="stat-label">Total sales</span>
              <span className="stat-icon">
                <FileText size={15} />
              </span>
            </div>
            <div className="stat-value">{currency(totalSales)}</div>
            {deltas?.sales != null && (
              <div className={`stat-delta ${deltas.sales >= 0 ? "up" : "down"}`}>
                {deltas.sales >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {Math.abs(deltas.sales).toFixed(1)}% from last month
              </div>
            )}
          </div>

          <div className="stat-card stat-card-light">
            <div className="stat-top">
              <span className="stat-label">Total profit</span>
              <span className="stat-icon">
                <TrendingUp size={15} />
              </span>
            </div>
            <div className="stat-value">{currency(totalProfit)}</div>
            {deltas?.profit != null && (
              <div className={`stat-delta ${deltas.profit >= 0 ? "up" : "down"}`}>
                {deltas.profit >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {Math.abs(deltas.profit).toFixed(1)}% from last month
              </div>
            )}
          </div>
        </section>

        <section className="invoices-section">
          <div className="invoices-header">
            <h2>All invoices</h2>
            <p>
              {filteredInvoices.length} invoice{filteredInvoices.length === 1 ? "" : "s"} · {periodLabel}
            </p>
          </div>

          <MonthFilter
            month={filter.month}
            year={filter.year}
            years={years}
            onChangeMonth={(month) => setFilter((f) => ({ ...f, month: month === "all" ? "all" : Number(month) }))}
            onChangeYear={(year) => setFilter((f) => ({ ...f, year: year === "all" ? "all" : Number(year) }))}
          />

          <PaymentFilterBar value={paymentFilter} onChange={setPaymentFilter} />

          <div className="invoice-card">
            {loading ? (
              <p className="empty-state">Loading your invoices…</p>
            ) : (
              <InvoiceList
                invoices={filteredInvoices}
                onDelete={handleDelete}
                onSelect={(inv) => setViewingInvoiceId(inv.id)}
              />
            )}
          </div>
        </section>
      </main>

      {showForm && (
        <InvoiceForm invoices={invoices} onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {viewingInvoice && (
        <InvoiceDetail
          invoice={viewingInvoice}
          onClose={() => setViewingInvoiceId(null)}
          onTogglePayment={handleTogglePayment}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
