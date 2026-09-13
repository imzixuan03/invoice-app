import { ChevronLeft, ChevronRight } from "react-feather";

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function MonthFilter({ mode, month, year, onPrev, onNext, onToggleAll }) {
  return (
    <div className="month-filter">
      <button
        type="button"
        className="filter-nav-btn"
        onClick={onPrev}
        aria-label="Previous month"
      >
        <ChevronLeft size={22} />
      </button>

      <button type="button" className="filter-label" onClick={onToggleAll}>
        {mode === "all" ? "All time" : `${MONTH_LABELS[month]} ${year}`}
      </button>

      <button
        type="button"
        className="filter-nav-btn"
        onClick={onNext}
        aria-label="Next month"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
}