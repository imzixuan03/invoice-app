import { useEffect, useMemo, useState } from "react";
import { Plus } from "react-feather";
import { getInvoices, saveInvoice, deleteInvoice } from "./db.js";
import InvoiceList from "./components/InvoiceList.jsx";
import InvoiceForm from "./components/InvoiceForm.jsx";
import MonthFilter from "./components/MonthFilter.jsx";

const now = new Date();

export default function App() {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter state: "all" shows everything; "month" restricts to a given
  // month/year, navigated with the chevrons in MonthFilter.
  const [filter, setFilter] = useState({
    mode: "all",
    month: now.getMonth(),
    year: now.getFullYear()
  });

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

  function shiftMonth(delta) {
    setFilter((f) => {
      // Stepping from "all" starts you at the current month rather than
      // jumping blindly, then moves from there.
      const base = f.mode === "all" ? { month: now.getMonth(), year: now.getFullYear() } : f;
      let month = base.month + delta;
      let year = base.year;
      if (month < 0) {
        month = 11;
        year -= 1;
      } else if (month > 11) {
        month = 0;
        year += 1;
      }
      return { mode: "month", month, year };
    });
  }

  function toggleAll() {
    setFilter((f) => ({ ...f, mode: f.mode === "all" ? "month" : "all" }));
  }

  const filteredInvoices = useMemo(() => {
    if (filter.mode === "all") return invoices;
    return invoices.filter((inv) => {
      const d = new Date(inv.date);
      return d.getMonth() === filter.month && d.getFullYear() === filter.year;
    });
  }, [invoices, filter]);

  const totalProfit = filteredInvoices.reduce((sum, inv) => sum + Number(inv.profit || 0), 0);

  return (
    <div className="page">
      <header className="ledger-header">
        <p className="eyebrow-free">Total profit</p>
        <h1 className={`hero-total ${totalProfit < 0 ? "profit-negative" : ""}`}>
          {totalProfit.toLocaleString(undefined, { style: "currency", currency: "USD" })}
        </h1>
        <p className="hero-sub">
          {filteredInvoices.length} invoice{filteredInvoices.length === 1 ? "" : "s"}
          {filter.mode === "month" ? " this period" : " on record"}
        </p>

        <MonthFilter
          mode={filter.mode}
          month={filter.month}
          year={filter.year}
          onPrev={() => shiftMonth(-1)}
          onNext={() => shiftMonth(1)}
          onToggleAll={toggleAll}
        />
      </header>

      <main className="ledger-body">
        {loading ? (
          <p className="empty-state">Loading your invoices…</p>
        ) : (
          <InvoiceList invoices={filteredInvoices} onDelete={handleDelete} />
        )}
      </main>

      <button className="fab" onClick={() => setShowForm(true)} aria-label="Add invoice">
        <Plus size={28} />
      </button>

      {showForm && (
        <InvoiceForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}
    </div>
  );
}