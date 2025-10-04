import { type FC, useState, useEffect } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceDelay?: number; // optional (default 300ms)
}

const SearchBar: FC<SearchBarProps> = ({ 
  placeholder = "Search...", 
  onSearch, 
  debounceDelay = 300 
}) => {
  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Update debounced value after delay
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), debounceDelay);
    return () => clearTimeout(handler); // cleanup on re-type
  }, [value, debounceDelay]);

  // Trigger search when debounced value changes
  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const clearSearch = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className="flex items-center w-full max-w-md relative">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
      />

      {/* ❌ Clear button */}
      {value && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
