import { Link } from "react-router-dom";

export interface CategoryTeaser {
  name: string;
  slug: string;
  shopCount: number;
}

interface FeaturedCategoriesProps {
  categories: CategoryTeaser[];
}

const VISIBLE_LIMIT = 8;

export default function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  const visibleCategories = categories.slice(0, VISIBLE_LIMIT);

  if (visibleCategories.length === 0) return null;

  return (
    <section className="py-12 px-4 sm:px-6">
      <h2 className="text-2xl font-bold mb-8 text-center md:text-left">
        Browse by Category
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-4 sm:gap-6">
        {visibleCategories.map((category) => (
          <Link
            key={category.slug}
            to={`/categories/${category.slug}`}
            className="rounded-xl overflow-hidden shadow-md bg-gray-100 flex flex-col items-center p-4 hover:shadow-lg transition"
          >
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-brand-secondary text-white font-bold text-xl mb-3">
              {category.name[0]}
            </div>
            <p className="font-semibold text-gray-800 text-center text-sm sm:text-base">
              {category.name}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              {category.shopCount} shop{category.shopCount === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
      </div>

      {categories.length > VISIBLE_LIMIT && (
        <div className="flex justify-center mt-8">
          <Link
            to="/categories"
            className="px-5 py-2 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-secondary transition"
          >
            View All Categories
          </Link>
        </div>
      )}
    </section>
  );
}
