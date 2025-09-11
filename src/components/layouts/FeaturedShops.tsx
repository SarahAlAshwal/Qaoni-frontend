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
  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-8 text-center md:text-left">
        Featured Shops
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {shops.map((shop) => (
          <div
            key={shop.id}
            className="relative group rounded-xl overflow-hidden shadow-md"
          >
            {/* Shop Logo */}
            <img
              src={shop.logo}
              alt={`${shop.name} logo`}
              className="w-full h-28 sm:h-32 md:h-40 lg:h-48 object-contain bg-gray-100"
            />

            {/* Overlay */}
            <a
              href={shop.link}
              className="absolute inset-0 flex flex-col items-center justify-center 
                         bg-red-600/70 opacity-0 group-hover:opacity-100 
                         transition-opacity duration-300 text-white"
            >
              <p className="text-sm sm:text-base md:text-lg font-semibold mb-2">
                {shop.name}
              </p>
              <span className="px-3 py-1 bg-white text-red-600 text-xs sm:text-sm md:text-base rounded-md font-medium hover:bg-gray-100">
                Shop Now
              </span>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
