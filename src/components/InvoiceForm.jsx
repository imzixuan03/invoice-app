import { useEffect, useMemo, useState } from "react";
import { X, Check, Plus } from "react-feather";
import { getCompanies, saveCompany } from "../db.js";

const today = new Date();
const currency = (n) => Number(n || 0).toLocaleString(undefined, { style: "currency", currency: "USD" });

const MONTH_OPTIONS = [
  { value: "01", label: "01 · January" },
  { value: "02", label: "02 · February" },
  { value: "03", label: "03 · March" },
  { value: "04", label: "04 · April" },
  { value: "05", label: "05 · May" },
  { value: "06", label: "06 · June" },
  { value: "07", label: "07 · July" },
  { value: "08", label: "08 · August" },
  { value: "09", label: "09 · September" },
  { value: "10", label: "10 · October" },
  { value: "11", label: "11 · November" },
  { value: "12", label: "12 · December" }
];

function yearOptions() {
  const currentYear = today.getFullYear();
  const years = [];
  for (let y = currentYear - 3; y <= currentYear + 1; y++) {
    years.push(String(y).slice(-2));
  }
  return years;
}

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

// Looks at existing invoices to figure out the next sequence number for a
// given company code + month + year combination, e.g. SV0926-001, -002...
function nextSequence(invoices, code, month, year) {
  if (!code) return "001";
  const prefix = `${code}${month}${year}-`;
  const count = invoices.filter((inv) => inv.invoiceId && inv.invoiceId.startsWith(prefix)).length;
  return String(count + 1).padStart(3, "0");
}

export default function InvoiceForm({ invoices, onSave, onCancel }) {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({ code: "", name: "" });

  const [companyId, setCompanyId] = useState("");
  const [month, setMonth] = useState(String(today.getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(today.getFullYear()).slice(-2));

  const [form, setForm] = useState({
    date: today.toISOString().slice(0, 10),
    dealerName: "",
    productName: "",
    productType: "",
    cost: "",
    sellingPrice: ""
  });

  async function loadCompanies() {
    const list = await getCompanies();
    setCompanies(list);
    setLoadingCompanies(false);
    if (!companyId && list.length > 0) setCompanyId(list[0].id);
  }

  useEffect(() => {
    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCompany = companies.find((c) => c.id === companyId);

  const generatedId = useMemo(() => {
    if (!selectedCompany) return null;
    const seq = nextSequence(invoices, selectedCompany.code, month, year);
    return `${selectedCompany.code}${month}${year}-${seq}`;
  }, [invoices, selectedCompany, month, year]);

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

  function handleCompanySelectChange(value) {
    if (value === "__add__") {
      setShowAddCompany(true);
      return;
    }
    setCompanyId(value);
  }

  async function handleAddCompany() {
    if (!newCompany.code.trim() || !newCompany.name.trim()) return;
    const saved = await saveCompany(newCompany);
    await loadCompanies();
    setCompanyId(saved.id);
    setNewCompany({ code: "", name: "" });
    setShowAddCompany(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!generatedId) return;
    if (!form.date || !form.dealerName || !form.productType) return;
    if (form.cost === "" || form.sellingPrice === "") return;
    onSave({ ...form, invoiceId: generatedId });
  }

  return (
    <div className="page-overlay">
      <div className="page-overlay-header">
        <button type="button" className="icon-btn" onClick={onCancel} aria-label="Cancel">
          <X size={20} />
        </button>
        <h2>New invoice</h2>
        <span style={{ width: 40 }} />
      </div>

      <form className="form-body" onSubmit={handleSubmit}>
        <div className="form-card">
          <div className="field">
            <span>Invoice ID *</span>
          </div>

          <div className="field-row three-col">
            <label className="field">
              <span>Company</span>
              <select
                value={companyId}
                onChange={(e) => handleCompanySelectChange(e.target.value)}
                disabled={loadingCompanies}
              >
                {companies.length === 0 && <option value="">No companies yet</option>}
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}
                  </option>
                ))}
                <option value="__add__">+ Add company</option>
              </select>
            </label>

            <label className="field">
              <span>Month</span>
              <select value={month} onChange={(e) => setMonth(e.target.value)}>
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.value}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Year</span>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                {yearOptions().map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {showAddCompany && (
            <div className="add-company-block">
              <div className="add-company-inputs">
                <input
                  placeholder="Code (e.g. SV)"
                  maxLength={4}
                  value={newCompany.code}
                  onChange={(e) => setNewCompany((c) => ({ ...c, code: e.target.value.toUpperCase() }))}
                />
                <input
                  placeholder="Full company name"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany((c) => ({ ...c, name: e.target.value }))}
                />
              </div>
              <button type="button" className="btn-add-company" onClick={handleAddCompany}>
                <Plus size={16} />
                Add
              </button>
            </div>
          )}

          <div className="id-preview">
            <span>Generated ID</span>
            <span className="id-preview-value">{generatedId || "—"}</span>
          </div>

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

        <button type="submit" className="btn-save-full" disabled={!generatedId}>
          <Check size={18} />
          Save invoice
        </button>
      </form>
    </div>
  );
}
