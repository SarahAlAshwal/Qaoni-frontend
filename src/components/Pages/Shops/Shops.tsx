import { useEffect, useState } from "react";
import SearchBar from "../../Shared/SearchBar";
import Filter, { type FilterOption } from "../../Shared/Filter";
import ShopCard from "../Shops/ShopCard";
import { apiFetch } from "../../../services/api";
import type { Shop } from "./ShopCard";

interface CategorySummary {
  name: string;
  slug: string;
}

export default function ShopsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<string>("");
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [shopsRes, categoriesRes] = await Promise.all([
          apiFetch("/api/shops"),
          apiFetch("/api/categories"),
        ]);

        if (!shopsRes.ok) {
          throw new Error("Failed to load shops");
        }

        if (!categoriesRes.ok) {
          throw new Error("Failed to load categories");
        }

        const shopsData = await shopsRes.json();
        const categoriesData = await categoriesRes.json();

        if (!isMounted) return;

        setShops(
          Array.isArray(shopsData)
            ? shopsData
                .filter(
                  (shop: any) =>
                    shop?._id &&
                    typeof shop?.name === "string" &&
                    typeof shop?.slug === "string"
                )
                .map((shop: any) => ({
                  id: shop._id,
                  name: shop.name,
                  slug: shop.slug,
                  image: shop.heroImage?.url || shop.logo?.url || "",
                  description: shop.description || "",
                  categories: Array.isArray(shop.categories)
                    ? shop.categories.filter(
                        (value: unknown): value is string => typeof value === "string"
                      )
                    : [],
                }))
            : []
        );

        setCategories(
          Array.isArray(categoriesData)
            ? categoriesData
                .filter(
                  (category: any) =>
                    typeof category?.name === "string" &&
                    typeof category?.slug === "string"
                )
                .map((category: CategorySummary) => ({
                  label: category.name,
                  value: category.slug,
                }))
            : []
        );
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setErrorMessage("Failed to load shops.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter logic
  const filteredShops = shops.filter((shop) => {
    const normalizedQuery = searchQuery.toLowerCase();
    const matchesSearch =
      shop.name.toLowerCase().includes(normalizedQuery) ||
      shop.description.toLowerCase().includes(normalizedQuery);
    const matchesCategories =
      filters === "" ||
      shop.categories.some(
        (category) => category.toLowerCase().replace(/\s+/g, "-") === filters
      );
    return matchesSearch && matchesCategories;
  });

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <SearchBar onSearch={setSearchQuery} placeholder="Search businesses..." />
        <Filter
          categories={categories}
          onFilterChange={(f) => {
            // Extract the filter value from the object
            const filterValue = f.category || "";
            setFilters(filterValue);
          }}
        />
      </div>

      {/* Results */}
      {isLoading ? (
        <p className="text-gray-500 mt-6">Loading shops...</p>
      ) : errorMessage ? (
        <p className="text-red-600 mt-6">{errorMessage}</p>
      ) : filteredShops.length > 0 ? (
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
