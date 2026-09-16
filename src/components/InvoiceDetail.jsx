import { X, Check, Truck, DollarSign, Trash2 } from "react-feather";

const currency = (n) => Number(n || 0).toLocaleString(undefined, { style: "currency", currency: "MYR" });

export default function InvoiceDetail({ invoice, onClose, onTogglePayment, onDelete }) {
  if (!invoice) return null;

  function handleDelete() {
    onDelete(invoice.id);
    onClose();
  }

  return (
    <div className="page-overlay">
      <div className="page-overlay-header">
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <h2>{invoice.invoiceId}</h2>
        <button type="button" className="icon-btn" onClick={handleDelete} aria-label="Delete invoice">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="form-body">
        <div className="form-card detail-card">
          <div className="detail-row">
            <span>Date</span>
            <strong>
              {new Date(invoice.date).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "long",
                year: "numeric"
              })}
            </strong>
          </div>
          <div className="detail-row">
            <span>Dealer / Company</span>
            <strong>{invoice.dealerName}</strong>
          </div>
          {invoice.productName && (
            <div className="detail-row">
              <span>Product name</span>
              <strong>{invoice.productName}</strong>
            </div>
          )}
          <div className="detail-row">
            <span>Product type</span>
            <strong>{invoice.productType}</strong>
          </div>
          <div className="detail-row">
            <span>Cost</span>
            <strong>{currency(invoice.cost)}</strong>
          </div>
          <div className="detail-row">
            <span>Selling price</span>
            <strong>{currency(invoice.sellingPrice)}</strong>
          </div>
        </div>

        <div className="profit-preview">
          <span>Profit</span>
          <span className={`profit-preview-value ${invoice.profit < 0 ? "profit-negative" : ""}`}>
            {currency(invoice.profit)}
          </span>
        </div>

        <div className="payment-toggle-section">
          <p className="payment-toggle-label">Payment status</p>

          <button
            type="button"
            className={`payment-toggle-btn ${invoice.dealerPaid ? "is-paid" : ""}`}
            onClick={() => onTogglePayment(invoice.id, "dealerPaid", !invoice.dealerPaid)}
          >
            <span className="payment-toggle-icon">
              {invoice.dealerPaid ? <Check size={18} /> : <Truck size={18} />}
            </span>
            <span className="payment-toggle-text">
              <strong>Dealer Paid</strong>
              <span>{invoice.dealerPaid ? "Paid — tap to undo" : "Not paid yet — tap to mark paid"}</span>
            </span>
          </button>

          <button
            type="button"
            className={`payment-toggle-btn ${invoice.commissionPaid ? "is-paid" : ""}`}
            onClick={() => onTogglePayment(invoice.id, "commissionPaid", !invoice.commissionPaid)}
          >
            <span className="payment-toggle-icon">
              {invoice.commissionPaid ? <Check size={18} /> : <DollarSign size={18} />}
            </span>
            <span className="payment-toggle-text">
              <strong>Commission Paid</strong>
              <span>
                {invoice.commissionPaid ? "Paid — tap to undo" : "Not paid yet — tap to mark paid"}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
