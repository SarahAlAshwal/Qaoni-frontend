import { useParams } from "react-router-dom";
import ShopCard from "../Shops/ShopCard";
import clothImage from "../../../assets/cloth-shop.jpeg";
import techImage from "../../../assets/tech-store-shop.jpg";

const mockShops = [
  { id: "1", name: "TechWorld", description: "Latest gadgets", image: techImage, categories: ["electronics"] },
  { id: "2", name: "GadgetHub", description: "Everything tech", image: techImage, categories: ["electronics"] },
  { id: "3", name: "Fashionista", description: "Trendy clothing", image: clothImage, categories: ["clothing"] },
];

const mockCategories = [
  { id: "1", name: "Clothing", slug: "clothing", type: "Retail" },
  { id: "2", name: "Restaurants", slug: "restaurants", type: "Food" },
  { id: "3", name: "Electronics", slug: "electronics", type: "Retail" },
  { id: "4", name: "Beauty & Wellness", slug: "beauty-wellness", type: "Services" },
];

export default function CategoryDetailsPage() {
  const { slug } = useParams();

  const category = mockCategories.find((category) => category.slug === slug);
  const filteredShops = mockShops.filter((shop) => shop.categories.includes(slug!));

  if (!category) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <p className="text-gray-500">Category not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Category header */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-36 h-36 rounded-full bg-red-600 flex items-center justify-center shadow-md">
          <h1 className="text-white text-2xl font-semibold text-center px-3">
            {category.name}
          </h1>
        </div>
      </div>

      {/* Shops under this category */}
      {filteredShops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
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
