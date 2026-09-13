import { useMemo, useState } from "react";
import { X, Check } from "react-feather";

const today = new Date().toISOString().slice(0, 10);
const currency = (n) => Number(n || 0).toLocaleString(undefined, { style: "currency", currency: "USD" });

// Suggestions only - the field still accepts free text for anything not listed.
const PRODUCT_TYPE_SUGGESTIONS = [
  "SSD",
  "HDD",
  "Motherboard",
  "RAM",
  "CPU",
  "GPU",
  "PSU",
  "Case",
  "CPU Cooler",
  "Case Fan",
  "Monitor",
  "Keyboard",
  "Mouse"
];

export default function InvoiceForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    invoiceId: "",
    date: today,
    dealerName: "",
    productName: "",
    productType: "",
    cost: "",
    sellingPrice: ""
  });

  const profit = useMemo(() => {
    if (form.cost === "" || form.sellingPrice === "") return null;
    const cost = Number(form.cost);
    const sellingPrice = Number(form.sellingPrice);
    if (Number.isNaN(cost) || Number.isNaN(sellingPrice)) return null;
    return sellingPrice - cost;
  }, [form.cost, form.sellingPrice]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.invoiceId || !form.date || !form.dealerName || !form.productType) return;
    if (form.cost === "" || form.sellingPrice === "") return;
    onSave(form);
  }

  return (
    <div className="page-overlay">
      <div className="page-overlay-header">
        <button type="button" className="icon-btn" onClick={onCancel} aria-label="Cancel">
          <X size={20} />
        </button>
        <h2>New invoice</h2>
        {/* Spacer keeps the title visually centered against the left icon button */}
        <span style={{ width: 40 }} />
      </div>

      <form className="form-body" onSubmit={handleSubmit}>
        <div className="form-card">
          <label className="field">
            <span>Invoice ID *</span>
            <input
              className="mono-input"
              placeholder="INV-0007"
              value={form.invoiceId}
              onChange={(e) => update("invoiceId", e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Date *</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Dealer / Company name *</span>
            <input
              placeholder="Dealer or company name"
              value={form.dealerName}
              onChange={(e) => update("dealerName", e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Product name</span>
            <input
              placeholder="Optional, e.g. Samsung 980 Pro 1TB"
              value={form.productName}
              onChange={(e) => update("productName", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Product type *</span>
            <input
              list="product-type-options"
              placeholder="e.g. SSD, Motherboard, RAM"
              value={form.productType}
              onChange={(e) => update("productType", e.target.value)}
              required
            />
            <datalist id="product-type-options">
              {PRODUCT_TYPE_SUGGESTIONS.map((type) => (
                <option key={type} value={type} />
              ))}
            </datalist>
          </label>

          <div className="field-row">
            <label className="field">
              <span>Cost of product *</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="0.00"
                value={form.cost}
                onChange={(e) => update("cost", e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Selling price *</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="0.00"
                value={form.sellingPrice}
                onChange={(e) => update("sellingPrice", e.target.value)}
                required
              />
            </label>
          </div>
        </div>

        <div className="profit-preview">
          <span>Profit</span>
          <span className={`profit-preview-value ${profit < 0 ? "profit-negative" : ""}`}>
            {profit === null ? "—" : currency(profit)}
          </span>
        </div>

        <button type="submit" className="btn-save-full">
          <Check size={18} />
          Save invoice
        </button>
      </form>
    </div>
  );
}
