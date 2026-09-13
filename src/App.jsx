import { useEffect, useState } from "react";
import { getInvoices, saveInvoice, deleteInvoice } from "./db.js";
import InvoiceList from "./components/InvoiceList.jsx";
import InvoiceForm from "./components/InvoiceForm.jsx";

export default function App() {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const totalProfit = invoices.reduce((sum, inv) => sum + Number(inv.profit || 0), 0);

  return (
    <div className="page">
      <header className="ledger-header">
        <p className="eyebrow-free">Total profit</p>
        <h1 className={`hero-total ${totalProfit < 0 ? "profit-negative" : ""}`}>
          {totalProfit.toLocaleString(undefined, { style: "currency", currency: "USD" })}
        </h1>
        <p className="hero-sub">
          {invoices.length} invoice{invoices.length === 1 ? "" : "s"} on record
        </p>
      </header>

      <main className="ledger-body">
        {loading ? (
          <p className="empty-state">Loading your invoices…</p>
        ) : (
          <InvoiceList invoices={invoices} onDelete={handleDelete} />
        )}
      </main>

      <button className="fab" onClick={() => setShowForm(true)} aria-label="Add invoice">
        +
      </button>

      {showForm && (
        <InvoiceForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}
    </div>
  );
}
