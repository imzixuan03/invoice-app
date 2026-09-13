import { X } from "react-feather";

const currency = (n) => Number(n || 0).toLocaleString(undefined, { style: "currency", currency: "USD" });

export default function InvoiceList({ invoices, onDelete }) {
  if (invoices.length === 0) {
    return (
      <div className="empty-state">
        <p>No invoices yet.</p>
        <p className="empty-state-sub">Tap + to log your first one.</p>
      </div>
    );
  }

  return (
    <ul className="invoice-list">
      {invoices.map((inv) => (
        <li key={inv.id} className="invoice-row">
          <div className="invoice-row-top">
            <span className="invoice-id">{inv.invoiceId}</span>
            <div className="invoice-row-top-right">
              <span className={`amount ${inv.profit < 0 ? "profit-negative" : ""}`}>
                {inv.profit < 0 ? "-" : "+"}
                {currency(Math.abs(inv.profit))}
              </span>
              <button
                className="delete-btn"
                onClick={() => onDelete(inv.id)}
                aria-label={`Delete invoice ${inv.invoiceId}`}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="invoice-row-mid">
            {inv.dealerName}
            {inv.productName ? ` · ${inv.productName}` : ""}
            <span> ({inv.productType})</span>
          </div>

          <div className="invoice-row-bottom">
            <span>
              {new Date(inv.date).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric"
              })}
            </span>
            <span className="cost-sell">
              {currency(inv.cost)} → {currency(inv.sellingPrice)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
