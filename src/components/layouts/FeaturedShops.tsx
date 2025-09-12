// src/components/FeaturedShops.tsx
import React from "react";

export interface Shop {
  id: string;
  name: string;
  logo: string; // image url
  link: string;
}

interface FeaturedShopsProps {
  shops: Shop[];
}

export default function FeaturedShops({ shops }: FeaturedShopsProps) {
  // Limits
  const mobileLimit = 3;
  const tabletLimit = 6;
  const desktopLimit = 15;

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-8 text-center md:text-left">
        Featured Shops
      </h2>

      {/* Mobile (≤ sm) → 1 col, max 3 shops */}
      <div className="grid grid-cols-1 gap-6 sm:hidden">
        {shops.slice(0, mobileLimit).map((shop) => (
          <div
            key={shop.id}
            className="rounded-xl overflow-hidden shadow-md bg-gray-100 flex flex-col items-center p-4"
          >
            <img
              src={shop.logo}
              alt={`${shop.name} logo`}
              className="w-full h-28 object-contain mb-3"
            />
            <p className="text-base font-semibold text-gray-800">{shop.name}</p>
            <a
              href={shop.link}
              className="mt-2 px-4 py-1 bg-red-600 text-white text-sm rounded-md font-medium hover:bg-red-700 transition"
            >
              Shop Now
            </a>
          </div>
        ))}
      </div>
      {shops.length > mobileLimit && (
        <div className="sm:hidden flex justify-center mt-8">
          <a
            href="/shops"
            className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            View All Shops
          </a>
        </div>
      )}

      {/* Tablet (≥ sm and < md) → 2 cols, max 6 shops */}
      <div className="hidden sm:grid md:hidden grid-cols-2 gap-6">
        {shops.slice(0, tabletLimit).map((shop) => (
          <div
            key={shop.id}
            className="rounded-xl overflow-hidden shadow-md bg-gray-100 flex flex-col items-center p-4"
          >
            <img
              src={shop.logo}
              alt={`${shop.name} logo`}
              className="w-full h-28 object-contain mb-3"
            />
            <p className="text-base font-semibold text-gray-800">{shop.name}</p>
            <a
              href={shop.link}
              className="mt-2 px-4 py-1 bg-red-600 text-white text-sm rounded-md font-medium hover:bg-red-700 transition"
            >
              Shop Now
            </a>
          </div>
        ))}
      </div>
      {shops.length > tabletLimit && (
        <div className="hidden sm:flex md:hidden justify-center mt-8">
          <a
            href="/shops"
            className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            View All Shops
          </a>
        </div>
      )}

      {/* Desktop (≥ md) → 5 cols, max 15 shops */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {shops.slice(0, desktopLimit).map((shop) => (
          <div
            key={shop.id}
            className="relative group rounded-xl overflow-hidden shadow-md"
          >
            <img
              src={shop.logo}
              alt={`${shop.name} logo`}
              className="w-full h-40 lg:h-48 object-contain bg-gray-100"
            />
            {/* Hover Overlay */}
            <a
              href={shop.link}
              className="absolute inset-0 flex flex-col items-center justify-center 
                         bg-red-600/70 opacity-0 group-hover:opacity-100 
                         transition-opacity duration-300 text-white"
            >
              <p className="text-lg font-semibold mb-2">{shop.name}</p>
              <span className="px-3 py-1 bg-white text-red-600 text-sm rounded-md font-medium hover:bg-gray-100">
                Shop Now
              </span>
            </a>
          </div>
        ))}
      </div>
      {shops.length > desktopLimit && (
        <div className="hidden md:flex justify-center mt-8">
          <a
            href="/shops"
            className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            View All Shops
          </a>
        </div>
      )}
    </section>
  );
}
