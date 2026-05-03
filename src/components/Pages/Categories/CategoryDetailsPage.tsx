import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ShopCard from "../Shops/ShopCard";

interface CategoryDetails {
  name: string;
  slug: string;
  shopCount: number;
  shops: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    categories: string[];
  }>;
}

export default function CategoryDetailsPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<CategoryDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCategory = async () => {
      if (!slug) {
        setErrorMessage("Category not found.");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/categories/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Category not found.");
          }

          throw new Error("Failed to load category.");
        }

        const data = await res.json();
        if (!isMounted) return;

        setCategory(data);
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load category.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadCategory();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <p className="text-gray-500">Loading category...</p>
      </div>
    );
  }

  if (!category || errorMessage) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <p className="text-gray-500">{errorMessage || "Category not found."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Category header */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-36 h-36 rounded-full bg-brand-primary flex items-center justify-center shadow-md">
          <h1 className="text-white text-2xl font-semibold text-center px-3">
            {category.name}
          </h1>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          {category.shopCount} shop{category.shopCount === 1 ? "" : "s"} in this category
        </p>
      </div>

      {/* Shops under this category */}
      {category.shops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {category.shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">
          No shops found in this category.
        </p>
      )}
    </div>
  );
}
