import { useState } from "react";
import SearchBar from "../../Shared/SearchBar";
import Filter, { type FilterOption } from "../../Shared/Filter";
import ShopCard from "../Shops/ShopCard";
import clothImage from '../../../assets/cloth-shop.jpeg';
import bookImage from '../../../assets/shop-book.jpeg';
import techImage from '../../../assets/tech-store-shop.jpg';

const categories: FilterOption[] = [
  { label: "All", value: "" },
  { label: "Clothing", value: "clothing" },
  { label: "Electronics", value: "electronics" },
  { label: "Books", value: "books" },
];

const shops = [
  {
    id: "1",
    name: "Trendy Clothes",
    image: clothImage,
    description: "Latest fashion trends at affordable prices.",
    categories: ["clothing", "accessories"],
  },
  {
    id: "2",
    name: "Tech World",
    image: techImage,
    description: "Best electronics, gadgets, and accessories.",
    categories: ["electronics"],
  },
  {
    id: "3",
    name: "Book Haven",
    image: bookImage,
    description: "Your favorite books and stationery.",
    categories: ["books"],
  },
    {
    id: "4",
    name: "Trendy Clothes",
    image: clothImage,
    description: "Latest fashion trends at affordable prices.",
    categories:  ["clothing", "accessories", "bags", "clothing", "accessories", "bags"],
  },
  {
    id: "5",
    name: "Tech World",
    image: techImage,
    description: "Best electronics, gadgets, and accessories.",
    categories: ["electronics"],
  },
  {
    id: "6",
    name: "Book Haven",
    image: bookImage,
    description: "Your favorite books and stationery.",
    categories: ["books"],
  },
    {
    id: "7",
    name: "Trendy Clothes",
    image: clothImage,
    description: "Latest fashion trends at affordable prices.",
    categories: ["clothing"],
  },
  {
    id: "8",
    name: "Tech World",
    image: techImage,
    description: "Best electronics, gadgets, and accessories.",
    categories: ["electronics"],
  },
  {
    id: "9",
    name: "Book Haven",
    image: bookImage,
    description: "Your favorite books and stationery.",
    categories: ["books"],
  },
];

export default function ShopsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{ categories?: string }>({});

  // Filter logic
  const filteredShops = shops.filter((shop) => {
    const matchesSearch = shop.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchescategories =
      !filters.categories || shop.categories.includes(filters.categories);
    return matchesSearch && matchescategories;
  });

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <SearchBar onSearch={setSearchQuery} placeholder="Search shops..." />
        <Filter
          categories={categories}
          onFilterChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
        />
      </div>

      {/* Results */}
      {filteredShops.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-6">No shops found.</p>
      )}
    </div>
  );
}
