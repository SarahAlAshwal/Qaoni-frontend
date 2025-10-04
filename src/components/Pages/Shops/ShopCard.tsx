// src/components/Shared/ShopCard.tsx
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export interface Shop {
  id: string;
  name: string;
  image: string;
  description: string;
  categories: string[]; // multiple categories
}

export default function ShopCard({ shop }: { shop: Shop }) {
  const visibleCategories = shop.categories.slice(0, 3);
  const extraCategories = shop.categories.slice(3);

  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Close tooltip on outside click OR scroll
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      tooltipRef.current &&
      !tooltipRef.current.contains(event.target as Node)
    ) {
      setShowTooltip(false);
    }
  };

  const handleScroll = () => {
    setShowTooltip(false);
  };

  if (showTooltip) {
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true); // true = capture all scrollable containers
  } else {
    document.removeEventListener("mousedown", handleClickOutside);
    window.removeEventListener("scroll", handleScroll, true);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
    window.removeEventListener("scroll", handleScroll, true);
  };
}, [showTooltip]);

  // Toggle tooltip (for mobile)
  const toggleTooltip = () => setShowTooltip((prev) => !prev);

  // Close tooltip on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTooltip]);

  return (
    <div className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
      {/* Shop Image */}
      <img
        src={shop.image}
        alt={shop.name}
        className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-500"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition" />

      {/* Centered Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
        <h3 className="text-xl font-bold drop-shadow-lg">{shop.name}</h3>
        <p className="text-sm mt-2 line-clamp-2 drop-shadow-md max-w-[90%]">
          {shop.description}
        </p>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mt-3 relative">
          {visibleCategories.map((cat, i) => (
            <span
              key={i}
              className="bg-red-600/90 text-white text-xs px-3 py-1 rounded-full shadow-md"
            >
              {cat}
            </span>
          ))}

          {extraCategories.length > 0 && (
            <div
              ref={tooltipRef}
              className="relative"
              onMouseEnter={() => setShowTooltip(true)} // Desktop hover
              onMouseLeave={() => setShowTooltip(false)} // Desktop hover
              onClick={toggleTooltip} // Mobile tap
            >
              <span className="bg-gray-600/80 text-white text-xs px-3 py-1 rounded-full shadow-md cursor-pointer select-none">
                +{extraCategories.length} more
              </span>

              {/* Tooltip */}
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-black/80 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-normal z-10">
                  {extraCategories.join(", ")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hover CTA */}
        <Link
          to={`/shops/${shop.id}`}
          className="mt-4 bg-white text-red-600 font-medium text-sm px-4 py-2 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition duration-300"
        >
          Visit Shop
        </Link>
      </div>
    </div>
  );
}
