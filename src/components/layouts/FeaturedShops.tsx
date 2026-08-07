import { shopNameSize } from "../../utils/nameSize";

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
    <section className="py-12 px-4 sm:px-6">
      <h2 className="text-2xl font-bold mb-8 text-center md:text-left">
        Featured Businesses
      </h2>

      {/* Mobile (< sm) → 2 cols */}
      <div className="grid grid-cols-2 gap-4 sm:hidden">
        {shops.map((shop) => (
          <div
            key={`mobile-${shop.id}`}
            className="rounded-xl overflow-hidden shadow-md bg-gray-100 flex flex-col items-center p-4"
          >
            <img
              src={shop.logo}
              alt={`${shop.name} logo`}
              className="w-full h-28 object-contain mb-3"
            />
            <p className={`${shopNameSize(shop.name)} font-semibold text-gray-800`}>{shop.name}</p>
            <a
              href={shop.link}
              className="mt-2 px-4 py-1 bg-brand-primary text-white text-sm rounded-md font-medium hover:bg-brand-secondary transition"
            >
              Visit
            </a>
          </div>
        ))}
      </div>

      {/* Tablet (≥ sm and < md) → 2 cols */}
      <div className="hidden sm:grid md:hidden grid-cols-2 gap-6">
        {shops.map((shop) => (
          <div
            key={`tablet-${shop.id}`}
            className="rounded-xl overflow-hidden shadow-md bg-gray-100 flex flex-col items-center p-4"
          >
            <img
              src={shop.logo}
              alt={`${shop.name} logo`}
              className="w-full h-28 object-contain mb-3"
            />
            <p className={`${shopNameSize(shop.name)} font-semibold text-gray-800`}>{shop.name}</p>
            <a
              href={shop.link}
              className="mt-2 px-4 py-1 bg-brand-primary text-white text-sm rounded-md font-medium hover:bg-brand-secondary transition"
            >
              Visit
            </a>
          </div>
        ))}
      </div>

      {/* Desktop (≥ md) → up to 5 cols */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {shops.map((shop) => (
          <div
            key={`desktop-${shop.id}`}
            className="relative group rounded-xl overflow-hidden shadow-md"
          >
            <img
              src={shop.logo}
              alt={`${shop.name} logo`}
              className="w-full h-40 lg:h-48 object-contain bg-gray-100"
            />
            <a
              href={shop.link}
              className="absolute inset-0 flex flex-col items-center justify-center
                         bg-brand-primary/70 opacity-0 group-hover:opacity-100
                         transition-opacity duration-300 text-white"
            >
              <p className={`${shopNameSize(shop.name)} font-semibold mb-2`}>{shop.name}</p>
              <span className="px-3 py-1 bg-white text-brand-primary text-sm rounded-md font-medium hover:bg-brand-accent/30">
                Visit
              </span>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
