import { useMemo, useState } from "react";

const today = new Date().toISOString().slice(0, 10);

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
    const cost = Number(form.cost);
    const sellingPrice = Number(form.sellingPrice);
    if (Number.isNaN(cost) || Number.isNaN(sellingPrice)) return null;
    if (form.cost === "" || form.sellingPrice === "") return null;
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
    <div className="sheet-backdrop">
      <form className="sheet" onSubmit={handleSubmit}>
        <div className="sheet-header">
          <button type="button" className="text-btn" onClick={onCancel}>
            Cancel
          </button>
          <h2>New invoice</h2>
          <button type="submit" className="text-btn text-btn-primary">
            Save
          </button>
        </div>

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

        <div className="profit-preview">
          <span>Profit</span>
          <span className={`profit-preview-value ${profit < 0 ? "profit-negative" : ""}`}>
            {profit === null
              ? "—"
              : profit.toLocaleString(undefined, { style: "currency", currency: "USD" })}
          </span>
        </div>
      </form>
    </div>
  );
}
