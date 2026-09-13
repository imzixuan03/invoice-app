const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function MonthFilter({ month, year, years, onChangeMonth, onChangeYear }) {
  return (
    <div className="filter-row">
      <div className="filter-field">
        <label htmlFor="filter-month">Month</label>
        <select
          id="filter-month"
          value={month}
          onChange={(e) => onChangeMonth(e.target.value)}
        >
          <option value="all">All months</option>
          {MONTH_LABELS.map((label, index) => (
            <option key={label} value={index}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-year">Year</label>
        <select
          id="filter-year"
          value={year}
          onChange={(e) => onChangeYear(e.target.value)}
        >
          <option value="all">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
