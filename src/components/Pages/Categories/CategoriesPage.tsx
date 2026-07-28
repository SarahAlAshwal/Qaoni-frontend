import { useEffect, useState } from "react";
import SearchBar from "../../Shared/SearchBar";
import CategoryCard from "./CategoryCard";
import { apiFetch } from "../../../services/api";

interface CategorySummary {
  name: string;
  slug: string;
  shopCount: number;
  shopNames: string[];
}

const CategoriesPage = () => {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const res = await apiFetch("/api/categories");
        if (!res.ok) {
          throw new Error("Failed to load categories");
        }

        const data = await res.json();
        if (!isMounted) return;

        setCategories(
          Array.isArray(data)
            ? data
                .filter(
                  (category: any) =>
                    typeof category?.name === "string" &&
                    typeof category?.slug === "string"
                )
                .map((category: any) => ({
                  name: category.name,
                  slug: category.slug,
                  shopCount:
                    typeof category.shopCount === "number" ? category.shopCount : 0,
                  shopNames: Array.isArray(category.shopNames)
                    ? category.shopNames.filter(
                        (name: unknown): name is string => typeof name === "string"
                      )
                    : [],
                }))
            : []
        );
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setErrorMessage("Failed to load categories.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCategories = categories
    .filter((cat) => cat.shopCount > 0 && cat.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.shopCount - a.shopCount);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <title>Browse Categories | Qaoni</title>
      <meta name="description" content="Explore local businesses by category on Qaoni — from food and beauty to education, home services, and more." />
      <link rel="canonical" href="https://www.qaoni.ca/categories" />
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <SearchBar placeholder="Search categories..." onSearch={setQuery} />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-10">
        {isLoading && (
          <p className="text-gray-500 text-center col-span-full">
            Loading categories...
          </p>
        )}
        {errorMessage && !isLoading && (
          <p className="text-red-600 text-center col-span-full">
            {errorMessage}
          </p>
        )}
        {filteredCategories.map((cat) => (
          <CategoryCard
            key={cat.slug}
            name={cat.name}
            shops={cat.shopNames}
            shopCount={cat.shopCount}
            slug={cat.slug}
          />
        ))}
        {!isLoading && !errorMessage && filteredCategories.length === 0 && (
          <p className="text-gray-500 text-center col-span-full">
            No categories found.
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
