import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import facebookIcon from "../../../assets/facebook.svg";
import instagramIcon from "../../../assets/instagram.svg";
import { apiFetch } from "../../../services/api";

interface ShopImage {
  url: string;
  price?: number;
  description?: string;
  featured?: boolean;
}

interface ShopDetails {
  name: string;
  slug: string;
  description: string;
  categories: string[];
  hasDelivery?: boolean;
  heroImage?: { url: string } | string;
  logo?: { url: string } | string;
  gallery?: ShopImage[];
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    instagram?: string;
    facebook?: string;
  };
}

export default function ShopDetailsPage() {
  const { slug } = useParams();
  const [shop, setShop] = useState<ShopDetails | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ShopImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadShop = async () => {
      if (!slug) {
        setErrorMessage("Shop not found.");
        setIsLoading(false);
        return;
      }

      try {
        const res = await apiFetch(`/api/shops/slug/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Shop not found.");
          }

          throw new Error("Failed to load shop.");
        }

        const data = await res.json();
        if (!isMounted) return;

        setShop(data);
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load shop.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadShop();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <p className="text-gray-500">Loading shop...</p>
      </div>
    );
  }

  if (!shop || errorMessage) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <p className="text-gray-500">{errorMessage || "Shop not found."}</p>
      </div>
    );
  }

  const gallery = Array.isArray(shop.gallery) ? shop.gallery.filter((item) => item?.url) : [];
  const featuredProducts = gallery.filter((item) => item.featured);
  const displayedProducts = gallery.slice(0, 12);
  const heroUrl = typeof shop.heroImage === "string" ? shop.heroImage : shop.heroImage?.url;
  const logoUrl = typeof shop.logo === "string" ? shop.logo : shop.logo?.url;

  return (
    <div className="flex flex-col">
      {heroUrl ? (
        <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <img
            src={heroUrl}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">{shop.name}</h1>
            <div className="flex gap-2 flex-wrap justify-center">
              {shop.categories.map((cat) => (
                <span
                  key={cat}
                  className="bg-brand-secondary text-white px-3 py-1 rounded-full text-sm"
                >
                  {cat}
                </span>
              ))}
            </div>
            {shop.hasDelivery && (
              <div className="mt-2">
                <span className="bg-brand-accent text-white px-3 py-1 rounded-full text-sm">
                  Deliver
                </span>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="relative h-[40vh] md:h-[50vh] w-full bg-black flex items-center justify-center text-center text-white px-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-3">{shop.name}</h1>
            <div className="flex gap-2 flex-wrap justify-center">
              {shop.categories.map((cat) => (
                <span
                  key={cat}
                  className="bg-brand-primary text-white px-3 py-1 rounded-full text-sm"
                >
                  {cat}
                </span>
              ))}
            </div>
            {shop.hasDelivery && (
              <div className="mt-2">
                <span className="bg-brand-accent text-white px-3 py-1 rounded-full text-sm">
                  Deliver
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="container mx-auto px-6 py-10 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">About {shop.name}</h2>
          <p className="text-gray-700 leading-relaxed">{shop.description}</p>
        </div>
        {logoUrl && (
          <div className="flex-shrink-0">
            <img
              src={logoUrl}
              alt={`${shop.name} logo`}
              className="w-40 h-40 object-contain mx-auto"
            />
          </div>
        )}
      </section>

      {featuredProducts.length > 0 && (
        <section className="bg-gray-50 py-10">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {featuredProducts.map((product, index) => (
                <div
                  key={`${product.url}-${index}`}
                  className="bg-white shadow rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img
                    src={product.url}
                    alt={product.description || shop.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    {typeof product.price === "number" ? (
                      <p className="text-brand-primary font-medium mt-1">${product.price}</p>
                    ) : null}
                    {product.description ? (
                      <p className="text-gray-700 mt-1">{product.description}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 overflow-auto p-6"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="relative max-w-5xl w-full mx-auto bg-transparent rounded-xl shadow-2xl overflow-hidden flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="fixed top-6 right-6 text-white bg-brand-primary/50 cursor-pointer hover:bg-brand-primary/80 rounded-full p-3 text-2xl z-[60]"
            >
              X
            </button>

            <div className="flex items-center justify-center w-full h-full max-h-[90vh]">
              <img
                src={selectedProduct.url}
                alt={selectedProduct.description || shop.name}
                className="object-contain max-h-[90vh] max-w-full rounded-lg"
              />
            </div>

            {selectedProduct.description ? (
              <h2 className="mt-4 text-xl font-semibold text-white text-center">
                {selectedProduct.description}
              </h2>
            ) : null}
          </div>
        </div>
      )}

      <section className="container mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Our Products</h2>

        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {displayedProducts.map((product, index) => (
              <div
                key={`${product.url}-grid-${index}`}
                className="bg-white shadow rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <img
                  src={product.url}
                  alt={product.description || shop.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  {typeof product.price === "number" ? (
                    <p className="text-brand-primary font-medium mt-1">${product.price}</p>
                  ) : null}
                  {product.description ? (
                    <p className="text-gray-700 mt-1">{product.description}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No products uploaded yet.</p>
        )}
      </section>

      <section className="bg-gray-100 py-10">
        <div className="container mx-auto px-6 text-center md:text-left">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Contact {shop.name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <p><strong>Phone:</strong> {shop.contact?.phone || "Not provided"}</p>
              <p><strong>Email:</strong> {shop.contact?.email || "Not provided"}</p>
              <p><strong>Address:</strong> {shop.contact?.address || "Not provided"}</p>
            </div>

            <div className="flex items-center gap-4 mt-4">
              {shop.contact?.facebook && (
                <a
                  href={shop.contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-2xl transition"
                >
                  <img className="max-w-[20%]" src={facebookIcon} alt="facebook" />
                </a>
              )}

              {shop.contact?.instagram && (
                <a
                  href={shop.contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-800 text-2xl transition"
                >
                  <img className="max-w-[20%]" src={instagramIcon} alt="instagram" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
