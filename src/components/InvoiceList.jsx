import { X } from "react-feather";

const currency = (n) => Number(n || 0).toLocaleString(undefined, { style: "currency", currency: "MYR" });

export default function InvoiceList({ invoices, onDelete, onSelect }) {
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
        <li key={inv.id} className="invoice-row" onClick={() => onSelect(inv)}>
          <div className="invoice-row-top">
            <span className="invoice-id">{inv.invoiceId}</span>
            <div className="invoice-row-top-right">
              <span className={`amount ${inv.profit < 0 ? "profit-negative" : ""}`}>
                {inv.profit < 0 ? "-" : "+"}
                {currency(Math.abs(inv.profit))}
              </span>
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

          <div className="payment-status-bar">
            <span className={`payment-chip ${inv.dealerPaid ? "paid" : "unpaid"}`}>
              Dealer {inv.dealerPaid ? "Paid" : "Unpaid"}
            </span>
            <span className={`payment-chip ${inv.commissionPaid ? "paid" : "unpaid"}`}>
              Commission {inv.commissionPaid ? "Paid" : "Unpaid"}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
