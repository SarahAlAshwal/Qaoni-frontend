// src/components/Shared/CategoryCard.tsx
import { type FC } from "react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  shops: string[];
  shopCount?: number;
  maxVisibleShops?: number; // default: 3
  linkTo?: string; // link to category details page
  slug: string;
}

const CategoryCard: FC<CategoryCardProps> = ({
  name,
  shops,
  shopCount,
  maxVisibleShops = 3,
  linkTo,
  slug,
}) => {
  const visibleShops = shops.slice(0, maxVisibleShops);
  const hasMore = shops.length > maxVisibleShops;

  return (
    <Link  to={`/categories/${slug}`} >
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition min-h-[280px]">
        {/* Category circle */}
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-brand-secondary text-white font-bold text-xl mb-2">
                {name[0]} {/* first letter */}
            </div>
            <p className="font-medium text-gray-800">{name}</p>
            <p className="mb-3 text-sm text-gray-500">
              {shopCount ?? shops.length} shop{(shopCount ?? shops.length) === 1 ? "" : "s"}
            </p>


        {/* Shops list */}
        <ul className="text-gray-700 space-y-1">
            {visibleShops.map((shop, i) => (
            <li key={i}>{shop}</li>
            ))}
        </ul>

        {/* View all link */}
        {hasMore && (
            linkTo ? (
            <Link
                to={linkTo}
                className="mt-3 text-brand-primary font-medium hover:underline"
            >
                View All Shops
            </Link>
            ) : (
            <button className="mt-3 text-brand-primary font-medium hover:underline cursor-pointer">
                View All Shops
            </button>
            )
        )}
        </div>
    </Link>
  );
};

export default CategoryCard;
