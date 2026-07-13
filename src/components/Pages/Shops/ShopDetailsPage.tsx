import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import facebookIcon from "../../../assets/facebook.svg";
import instagramIcon from "../../../assets/instagram.svg";
import whatsappIcon from "../../../assets/whatsapp.svg";
import tiktokIcon from "../../../assets/tiktok.svg";
import { apiFetch } from "../../../services/api";
import { heroNameSize } from "../../../utils/nameSize";

interface ProductImage {
  url: string;
  publicId: string;
  order?: number;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  isFeatured: boolean;
  images: ProductImage[];
}

interface ShopDetails {
  _id: string;
  name: string;
  slug: string;
  description: string;
  categories: string[];
  hasDelivery?: boolean;
  heroImage?: { url: string } | string;
  logo?: { url: string } | string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    tiktok?: string;
  };
}

export default function ShopDetailsPage() {
  const { slug } = useParams();
  const [shop, setShop] = useState<ShopDetails | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [productImageIndex, setProductImageIndex] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");

  const stepProductImage = (id: string, total: number, dir: 1 | -1) => {
    setProductImageIndex((prev) => ({
      ...prev,
      [id]: ((prev[id] ?? 0) + dir + total) % total,
    }));
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!slug) {
        setErrorMessage("Shop not found.");
        setIsLoading(false);
        return;
      }

      try {
        const shopRes = await apiFetch(`/api/shops/slug/${slug}`);
        if (!shopRes.ok) {
          throw new Error(shopRes.status === 404 ? "Shop not found." : "Failed to load shop.");
        }

        const shopData: ShopDetails = await shopRes.json();
        if (!isMounted) return;
        setShop(shopData);

        const productsRes = await apiFetch(`/api/products/shop/${shopData._id}`);
        if (productsRes.ok && isMounted) {
          setProducts(await productsRes.json());
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load shop.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();
    return () => { isMounted = false; };
  }, [slug]);

  const handleSubscribe = async () => {
    if (!shop || !subscribeEmail.trim()) return;
    setSubscribeStatus("loading");
    try {
      const res = await apiFetch(`/api/subscriptions/${shop._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subscribeEmail.trim() }),
      });
      if (res.status === 409) { setSubscribeStatus("duplicate"); return; }
      if (!res.ok) { setSubscribeStatus("error"); return; }
      setSubscribeStatus("success");
      setSubscribeEmail("");
    } catch {
      setSubscribeStatus("error");
    }
  };

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

  const heroUrl = typeof shop.heroImage === "string" ? shop.heroImage : shop.heroImage?.url;
  const logoUrl = typeof shop.logo === "string" ? shop.logo : shop.logo?.url;
  const featuredProducts = products.filter((p) => p.isFeatured);
  const metaDescription = shop.description.length > 155
    ? shop.description.slice(0, 152) + "..."
    : shop.description;

  return (
    <div className="flex flex-col">
      <title>{shop.name} | Qaoni</title>
      <meta name="description" content={metaDescription} />
      {heroUrl ? (
        <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <img src={heroUrl} alt={shop.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white px-4">
            <h1 className={`${heroNameSize(shop.name)} font-bold mb-3`}>{shop.name}</h1>
            <div className="flex gap-2 flex-wrap justify-center">
              {shop.categories.map((cat) => (
                <span key={cat} className="bg-brand-secondary text-white px-3 py-1 rounded-full text-sm">{cat}</span>
              ))}
            </div>
            {shop.hasDelivery && (
              <div className="mt-2">
                <span className="bg-brand-accent text-white px-3 py-1 rounded-full text-sm">Deliver</span>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="relative h-[40vh] md:h-[50vh] w-full bg-black flex items-center justify-center text-center text-white px-4">
          <div>
            <h1 className={`${heroNameSize(shop.name)} font-bold mb-3`}>{shop.name}</h1>
            <div className="flex gap-2 flex-wrap justify-center">
              {shop.categories.map((cat) => (
                <span key={cat} className="bg-brand-secondary text-white px-3 py-1 rounded-full text-sm">{cat}</span>
              ))}
            </div>
            {shop.hasDelivery && (
              <div className="mt-2">
                <span className="bg-brand-accent text-white px-3 py-1 rounded-full text-sm">Deliver</span>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="container mx-auto px-6 pt-4 pb-10">
        {logoUrl && (
          <div className="relative z-10 w-fit min-w-20 md:min-w-28 max-w-36 md:max-w-48 mt-4 md:-mt-16 mb-6 rounded-2xl border-4 border-white shadow-lg overflow-hidden">
            <img src={logoUrl} alt={`${shop.name} logo`} className="w-full h-auto block" />
          </div>
        )}
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">About {shop.name}</h2>
        <p className="text-gray-700 leading-relaxed">{shop.description}</p>
      </section>

      {featuredProducts.length > 0 && (
        <section className="bg-gray-50 py-10">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {featuredProducts.map((product) => {
                const idx = productImageIndex[`feat-${product._id}`] ?? 0;
                return (
                <div
                  key={product._id}
                  className="bg-white shadow rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer"
                  onClick={() => { setSelectedProduct(product); setModalImageIndex(0); }}
                >
                  {product.images.length > 0 && (
                    <div className="relative h-48">
                      <img src={product.images[idx].url} alt={product.name} className="w-full h-48 object-contain bg-gray-50" />
                      {product.images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); stepProductImage(`feat-${product._id}`, product.images.length, -1); }}
                            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded cursor-pointer text-lg leading-none"
                          >‹</button>
                          <button
                            onClick={(e) => { e.stopPropagation(); stepProductImage(`feat-${product._id}`, product.images.length, 1); }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded cursor-pointer text-lg leading-none"
                          >›</button>
                          <span className="absolute bottom-1 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                            {idx + 1}/{product.images.length}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    {typeof product.price === "number" && (
                      <p className="text-brand-primary font-medium mt-1">${product.price}</p>
                    )}
                    {product.description && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                    )}
                  </div>
                </div>
              ); })}
            </div>
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="container mx-auto px-6 py-10">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Our Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => {
              const idx = productImageIndex[product._id] ?? 0;
              return (
                <div
                  key={product._id}
                  className="bg-white shadow rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer"
                  onClick={() => { setSelectedProduct(product); setModalImageIndex(0); }}
                >
                  {product.images.length > 0 && (
                    <div className="relative h-48">
                      <img src={product.images[idx].url} alt={product.name} className="w-full h-48 object-contain bg-gray-50" />
                      {product.images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); stepProductImage(product._id, product.images.length, -1); }}
                            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded cursor-pointer text-lg leading-none"
                          >‹</button>
                          <button
                            onClick={(e) => { e.stopPropagation(); stepProductImage(product._id, product.images.length, 1); }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded cursor-pointer text-lg leading-none"
                          >›</button>
                          <span className="absolute bottom-1 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                            {idx + 1}/{product.images.length}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    {typeof product.price === "number" && (
                      <p className="text-brand-primary font-medium mt-1">${product.price}</p>
                    )}
                    {product.description && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 overflow-auto p-6"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="relative max-w-2xl w-full mx-auto bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 text-gray-600 bg-gray-100 cursor-pointer hover:bg-gray-200 rounded-full p-2 z-10"
            >
              ✕
            </button>
            {selectedProduct.images.length > 0 && (
              <div className="relative bg-gray-50 pt-10">
                <img
                  src={selectedProduct.images[modalImageIndex].url}
                  alt={selectedProduct.name}
                  className="w-full max-h-[60vh] object-contain cursor-zoom-in"
                  onClick={() => window.open(selectedProduct.images[modalImageIndex].url, "_blank")}
                />
                <button
                  onClick={() => window.open(selectedProduct.images[modalImageIndex].url, "_blank")}
                  className="absolute bottom-2 left-2 bg-black/50 hover:bg-black/70 text-white rounded px-2 py-1 text-xs flex items-center gap-1 cursor-pointer"
                  title="View full size"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
                  </svg>
                  Full size
                </button>
                {selectedProduct.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setModalImageIndex((i) => (i - 1 + selectedProduct.images.length) % selectedProduct.images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded cursor-pointer text-xl leading-none"
                    >‹</button>
                    <button
                      onClick={() => setModalImageIndex((i) => (i + 1) % selectedProduct.images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded cursor-pointer text-xl leading-none"
                    >›</button>
                    <span className="absolute bottom-2 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {modalImageIndex + 1}/{selectedProduct.images.length}
                    </span>
                  </>
                )}
              </div>
            )}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
              {typeof selectedProduct.price === "number" && (
                <p className="text-brand-primary font-semibold text-lg mt-1">${selectedProduct.price}</p>
              )}
              {selectedProduct.description && (
                <p className="text-gray-700 mt-3">{selectedProduct.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <section className="container mx-auto px-6 py-10 text-left">
        <div className="max-w-md">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">Stay Updated</h2>
          <p className="text-gray-500 text-sm mb-4">Subscribe to get notified when {shop.name} adds new products.</p>
          {subscribeStatus === "success" ? (
            <p className="text-green-600 font-medium">You're subscribed!</p>
          ) : (
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                value={subscribeEmail}
                onChange={(e) => { setSubscribeEmail(e.target.value); setSubscribeStatus("idle"); }}
              />
              <button
                onClick={() => void handleSubscribe()}
                disabled={subscribeStatus === "loading" || !subscribeEmail.trim()}
                className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-secondary disabled:opacity-50 cursor-pointer"
              >
                {subscribeStatus === "loading" ? "..." : "Subscribe"}
              </button>
            </div>
          )}
          {subscribeStatus === "duplicate" && (
            <p className="text-amber-600 text-sm mt-2">This email is already subscribed.</p>
          )}
          {subscribeStatus === "error" && (
            <p className="text-red-600 text-sm mt-2">Something went wrong. Please try again.</p>
          )}
        </div>
      </section>

      <section className="bg-gray-100 py-10">
        <div className="container mx-auto px-6 text-center md:text-left">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Contact {shop.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="space-y-1">
              {shop.contact?.phone && <p><strong>Phone:</strong> {shop.contact.phone}</p>}
              {shop.contact?.email && <p><strong>Email:</strong> {shop.contact.email}</p>}
              {shop.contact?.address && <p><strong>Address:</strong> {shop.contact.address}</p>}
              {!shop.contact?.phone && !shop.contact?.email && !shop.contact?.address && (
                <p className="text-gray-400 italic">No contact info provided.</p>
              )}
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              {shop.contact?.facebook && (
                <a href={shop.contact.facebook} target="_blank" rel="noopener noreferrer">
                  <img className="w-8 h-8 object-contain hover:opacity-75 transition" src={facebookIcon} alt="Facebook" />
                </a>
              )}
              {shop.contact?.instagram && (
                <a href={shop.contact.instagram} target="_blank" rel="noopener noreferrer">
                  <img className="w-8 h-8 object-contain hover:opacity-75 transition" src={instagramIcon} alt="Instagram" />
                </a>
              )}
              {shop.contact?.whatsapp && (
                <a href={`https://wa.me/${shop.contact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                  <img className="w-8 h-8 object-contain hover:opacity-75 transition" src={whatsappIcon} alt="WhatsApp" />
                </a>
              )}
              {shop.contact?.tiktok && (
                <a href={shop.contact.tiktok} target="_blank" rel="noopener noreferrer">
                  <img className="w-8 h-8 object-contain hover:opacity-75 transition" src={tiktokIcon} alt="TikTok" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
