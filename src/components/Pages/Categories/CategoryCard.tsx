// src/components/Shared/CategoryCard.tsx
import { type FC } from "react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  shops: string[];
  maxVisibleShops?: number; // default: 3
  linkTo?: string; // link to category details page
}

const CategoryCard: FC<CategoryCardProps> = ({
  name,
  shops,
  maxVisibleShops = 3,
  linkTo,
}) => {
  const visibleShops = shops.slice(0, maxVisibleShops);
  const hasMore = shops.length > maxVisibleShops;

  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition">
      {/* Category circle */}
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-600 text-white font-bold text-xl mb-2">
            {name[0]} {/* first letter */}
        </div>
        <p className="font-medium text-gray-800">{name}</p>


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
            className="mt-3 text-red-600 font-medium hover:underline"
          >
            View All Shops
          </Link>
        ) : (
          <button className="mt-3 text-red-600 font-medium hover:underline">
            View All Shops
          </button>
        )
      )}
    </div>
  );
};

export default CategoryCard;
