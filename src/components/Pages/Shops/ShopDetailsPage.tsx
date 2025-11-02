import { useState } from 'react';
import { useParams } from "react-router-dom";
import logo from '../../../assets/tech-store-shop.jpg';
import hero from '../../../assets/tech-hero-image.jpg';
import phone from '../../../assets/phone.jpeg';
import smartwatch from '../../../assets/smartwatch.jpeg';

// Mock data for now
const mockShop = {
  id: "1",
  name: "TechWorld",
  heroImage: hero,
  logo: logo,
  description:
    "TechWorld is your ultimate destination for cutting-edge gadgets and electronics. We bring innovation closer to you with the latest devices and accessories.",
  categories: ["Electronics", "Gadgets"],
  featuredProducts: [
    { id: "p1", name: "Smartphone X1", price: "$799", image: phone },
    { id: "p2", name: "Smartwatch Pro", price: "$299", image: smartwatch },
  ],
  products: Array.from({ length: 12 }, (_, i) => ({
    id: `prod-${i}`,
    name: `Product ${i + 1}`,
    price: `$${(i + 1) * 25}`,
    image: phone,
  })),
  contact: {
    phone: "123-456-7890",
    email: "info@techworld.com",
    address: "123 Innovation Drive, Ottawa, ON",
    website: "https://techworld.ca",
  },
};

interface product {
  id: string;
  name: string;
  price: string;
  image: string;
}

export default function ShopDetailsPage() {
  const [selectedProduct, setSelectedProduct] = useState<product | null>(null);
  // In real app: fetch shop by ID from backend or API
  const shop = mockShop; // fallback for now

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <img
          src={shop.heroImage}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">{shop.name}</h1>
          <div className="flex gap-2 flex-wrap justify-center">
            {shop.categories.map((cat) => (
              <span
                key={cat}
                className="bg-red-600 text-white px-3 py-1 rounded-full text-sm"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-6 py-10 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">About {shop.name}</h2>
          <p className="text-gray-700 leading-relaxed">{shop.description}</p>
        </div>
        {shop.logo && (
          <div className="flex-shrink-0">
            <img
              src={shop.logo}
              alt={`${shop.name} logo`}
              className="w-40 h-40 object-contain mx-auto"
            />
          </div>
        )}
      </section>

      {/* Featured Products */}
      {shop.featuredProducts.length > 0 && (
        <section className="bg-gray-50 py-10">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {shop.featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white shadow rounded-xl overflow-hidden hover:shadow-lg transition"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                    <p className="text-red-600 font-medium mt-1">{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Modal */}
     {selectedProduct && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 overflow-auto p-6"
    onClick={() => setSelectedProduct(null)}
  >
    <div
      className="relative max-w-5xl w-full mx-auto bg-transparent rounded-xl shadow-2xl overflow-hidden flex flex-col items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setSelectedProduct(null)}
        className="fixed top-6 right-6 text-white bg-red-600 cursor-pointer bg-opacity-50 hover:bg-opacity-80 rounded-full p-3 text-2xl z-[60]"
      >
        ×
      </button>

      {/* Image wrapper ensures proper centering and scaling */}
      <div className="flex items-center justify-center w-full h-full max-h-[90vh]">
        <img
          src={selectedProduct.image}
          alt={selectedProduct.name}
          className="object-contain max-h-[90vh] max-w-full rounded-lg"
        />
      </div>

      <h2 className="mt-4 text-xl font-semibold text-white text-center">
        {selectedProduct.name}
      </h2>
    </div>
  </div>
)}

          </div>
        </section>
      )}

      {/* All Products with Pagination */}
      <section className="container mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Our Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {shop.products.slice(0, 6).map((product) => (
            <div
              key={product.id}
              className="bg-white shadow rounded-xl overflow-hidden hover:shadow-lg transition"
              onClick={() => setSelectedProduct(product)}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                <p className="text-red-600 font-medium mt-1">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination Placeholder */}
        <div className="flex justify-center mt-8">
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Load More
          </button>
        </div>
      </section>

      {/* Contact Info */}
      <section className="bg-gray-100 py-10">
        <div className="container mx-auto px-6 text-center md:text-left">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Contact {shop.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <p><strong>Phone:</strong> {shop.contact.phone}</p>
              <p><strong>Email:</strong> {shop.contact.email}</p>
              <p><strong>Address:</strong> {shop.contact.address}</p>
            </div>
            <div>
              <p>
                <strong>Website:</strong>{" "}
                <a
                  href={shop.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline"
                >
                  {shop.contact.website}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
