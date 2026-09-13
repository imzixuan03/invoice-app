import { X } from "react-feather";

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
        <li key={inv.id} className={`invoice-row ${inv.profit < 0 ? "profit-negative-row" : ""}`}>
          <div className="invoice-row-main">
            <span className="invoice-number">{inv.invoiceId}</span>
            <span className="invoice-client">{inv.dealerName}</span>
            <span className="invoice-product">
              {inv.productType}
              {inv.productName ? ` · ${inv.productName}` : ""}
            </span>
          </div>

          <div className="invoice-row-meta">
            <span className="invoice-date">
              {new Date(inv.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric"
              })}
            </span>
            <span className="cost-sell">
              cost {inv.cost.toLocaleString(undefined, { style: "currency", currency: "USD" })}
              {" → "}
              sell{" "}
              {inv.sellingPrice.toLocaleString(undefined, { style: "currency", currency: "USD" })}
            </span>
          </div>

          <div className="invoice-row-amount">
            <span className={`amount ${inv.profit < 0 ? "profit-negative" : ""}`}>
              {inv.profit.toLocaleString(undefined, { style: "currency", currency: "USD" })}
            </span>
            <button
              className="delete-btn"
              onClick={() => onDelete(inv.id)}
              aria-label={`Delete invoice ${inv.invoiceId}`}
            >
              <X size={20} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}