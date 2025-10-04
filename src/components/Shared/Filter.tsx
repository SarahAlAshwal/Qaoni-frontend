import { type FC } from "react";

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterProps {
  categories: FilterOption[];
  onFilterChange: (filters: { category?: string }) => void;
}

const Filter: FC<FilterProps> = ({ categories, onFilterChange }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Category filter */}
      <select
        onChange={(e) => onFilterChange({ category: e.target.value })}
        className="border px-3 py-2 rounded-md"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      {/* Location filter */}
    </div>
  );
};

export default Filter;
