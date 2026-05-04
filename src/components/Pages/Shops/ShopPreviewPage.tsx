import instagramIcon from '../../../assets/instagram.svg';
import facebookIcon from '../../../assets/facebook.svg';

interface GalleryImage {
  url: string;
  price?: string;
  description?: string;
  featured?: boolean;
}

interface ShopPreviewProps {
  data: {
    name: string;
    description: string;
    location: string;
    hasDelivery?: boolean;
    categories: string[];
    contact: {
      phone: string;
      email: string;
      address: string;
      instagram?: string;
      facebook?: string;
    };
  };
  logo: string | null;
  hero: string | null;
  gallery: GalleryImage[];
  onClose: () => void;
  modeTitle?: string;
  actionLabel?: string;
  statusLabel?: string;
  statusActionLabel?: string;
  onStatusAction?: () => void;
  statusModalTitle?: string;
  statusModalDescription?: string;
  statusModalOpen?: boolean;
  statusModalDisabled?: boolean;
  statusModalConfirmLabel?: string;
  statusChecklist?: Array<{ label: string; ok: boolean }>;
  onCloseStatusModal?: () => void;
  onConfirmStatusAction?: () => void;
}

export default function ShopPreviewPage({
  data,
  logo,
  hero,
  gallery,
  onClose,
  modeTitle = "Preview Mode",
  actionLabel = "Back to Editor",
  statusLabel,
  statusActionLabel,
  onStatusAction,
  statusModalTitle,
  statusModalDescription,
  statusModalOpen = false,
  statusModalDisabled = false,
  statusModalConfirmLabel,
  statusChecklist,
  onCloseStatusModal,
  onConfirmStatusAction,
}: ShopPreviewProps) {
  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">

      {/* Top Bar */}
      <div className="w-full bg-white shadow p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">{modeTitle}</h1>
          {statusLabel ? (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              {statusLabel}
            </span>
          ) : null}
          {statusActionLabel && onStatusAction ? (
            <button
              onClick={onStatusAction}
              className={`rounded-lg px-3 py-1 text-sm font-medium cursor-pointer ${
                statusLabel === "Published"
                  ? "border border-brand-primary bg-white text-brand-primary hover:border-brand-secondary hover:text-brand-secondary"
                  : "bg-brand-primary text-white hover:bg-brand-secondary"
              }`}
            >
              {statusActionLabel}
            </button>
          ) : null}
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-black text-white rounded-lg cursor-pointer"
        >
          {actionLabel}
        </button>
      </div>

      {/* Hero Section */}
      {hero ? (
        <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <img
            src={hero}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">
              {data.name}
            </h1>

            <div className="flex gap-2 flex-wrap justify-center">
              {data.categories.map((cat) => (
                <span
                  key={cat}
                  className="bg-brand-secondary text-white px-3 py-1 rounded-full text-sm"
                >
                  {cat}
                </span>
              ))}
            </div>
            {data.hasDelivery && (
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
            <h1 className="text-3xl md:text-5xl font-bold mb-3">
              {data.name}
            </h1>
            <div className="flex gap-2 flex-wrap justify-center">
              {data.categories.map((cat) => (
                <span
                  key={cat}
                  className="bg-brand-primary text-white px-3 py-1 rounded-full text-sm"
                >
                  {cat}
                </span>
              ))}
            </div>
            {data.hasDelivery && (
              <div className="mt-2">
                <span className="bg-brand-accent text-white px-3 py-1 rounded-full text-sm">
                  Deliver
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="container mx-auto px-6 py-10 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            About {data.name}
          </h2>
          <p className="text-gray-700 leading-relaxed">{data.description}</p>
        </div>

        {logo && (
          <div className="flex-shrink-0">
            <img
              src={logo}
              className="w-40 h-40 object-contain mx-auto"
            />
          </div>
        )}
      </section>

      {/* Featured Products */}
      {gallery.some((p) => p.featured) && (
        <section className="bg-gray-50 py-10">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Featured Products
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {gallery
                .filter((p) => p.featured)
                .map((product, i) => (
                  <div
                    key={i}
                    className="bg-white shadow rounded-xl overflow-hidden"
                  >
                    <img
                      src={product.url}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      {product.price && (
                        <p className="text-brand-primary font-medium">
                          ${product.price}
                        </p>
                      )}
                      {product.description && (
                        <p className="text-gray-700 mt-1 text-sm">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="container mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Our Products
        </h2>

        {gallery.length === 0 ? (
          <p className="text-gray-500">No products uploaded.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {gallery.map((img, i) => (
              <div
                key={i}
                className="bg-white shadow rounded-xl overflow-hidden"
              >
                <img
                  src={img.url}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  {img.price && (
                    <p className="text-brand-primary font-medium">{img.price}</p>
                  )}
                  {img.description && (
                    <p className="text-gray-700 mt-1">{img.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact */}
      <section className="bg-gray-100 py-10">
        <div className="container mx-auto px-6 text-center md:text-left">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Contact {data.name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <p><strong>Phone:</strong> {data.contact.phone}</p>
              <p><strong>Email:</strong> {data.contact.email}</p>
              <p><strong>Address:</strong> {data.contact.address}</p>
            </div>
            <div className="flex items-center gap-4 mt-4">
            {data.contact?.facebook && (
                <a
                href={data.contact?.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-2xl transition"
                >
                <img className="max-w-[20%]" src={facebookIcon} alt="facebook" />
                </a>
            )}

            {data.contact?.instagram && (
                <a
                href={data.contact?.instagram}
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

      {statusModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900">
              {statusModalTitle}
            </h2>
            {statusModalDescription ? (
              <p className="mt-2 text-sm text-gray-600">{statusModalDescription}</p>
            ) : null}

            {statusChecklist?.length ? (
              <div className="mt-4 rounded-xl bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">Checklist</p>
                <div className="mt-3 space-y-2">
                  {statusChecklist.map((check) => (
                    <div key={check.label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{check.label}</span>
                      <span className={check.ok ? "text-green-600" : "text-amber-600"}>
                        {check.ok ? "Ready" : "Missing"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onCloseStatusModal}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmStatusAction}
                disabled={statusModalDisabled}
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm text-white hover:bg-brand-secondary disabled:opacity-60 cursor-pointer"
              >
                {statusModalConfirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
