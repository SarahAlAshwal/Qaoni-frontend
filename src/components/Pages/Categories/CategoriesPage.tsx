import { useState } from "react";
import SearchBar from "../../Shared/SearchBar";
import CategoryCard from "./CategoryCard";
import Filter, { type FilterOption } from "../../Shared/Filter";

const mockCategories = [
  { id: 1, name: "Clothing", shops: ["Shop A", "Shop B", "Shop C", "Shop D"], type: "Retail" },
  { id: 2, name: "Restaurants", shops: ["Pizza Place", "Sushi Bar"], type: "Food" },
  { id: 3, name: "Electronics", shops: ["TechWorld"], type: "Retail" },
  { id: 4, name: "Beauty & Wellness", shops: ["SpaX"], type: "Services" },
];

const CategoriesPage = () => {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("");

  const filterOptions: FilterOption[] = [
    { label: "Retail", value: "Retail" },
    { label: "Food", value: "Food" },
    { label: "Services", value: "Services" },
  ];

  const filteredCategories = mockCategories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = selectedFilter === "" || cat.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <SearchBar placeholder="Search categories..." onSearch={setQuery} />

        <Filter
          categories={filterOptions}
          onFilterChange={(f) => {
            // Extract the filter value from the object
            const filterValue = f.category || "";
            setSelectedFilter(filterValue);
          }}
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => (
          <CategoryCard key={cat.id} name={cat.name} shops={cat.shops} />
        ))}
        {filteredCategories.length === 0 && (
          <p className="text-gray-500 text-center col-span-full">
            No categories found.
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;