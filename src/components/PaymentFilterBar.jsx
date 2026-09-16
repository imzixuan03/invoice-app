const OPTIONS = [
  { value: "all", label: "All" },
  { value: "dealerPaid", label: "Dealer Paid" },
  { value: "commissionPaid", label: "Commission Paid" },
  { value: "bothPaid", label: "Both Paid" },
  { value: "unpaid", label: "Unpaid" }
];

export default function PaymentFilterBar({ value, onChange }) {
  return (
    <div className="payment-filter-row">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`payment-filter-chip ${value === opt.value ? "active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
