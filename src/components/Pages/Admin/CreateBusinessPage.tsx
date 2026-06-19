import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../services/api";
import { saveImages } from "../../../services/imageService";
import { useAuth } from "../../../hooks/useAuth";
import ImageUploader from "../../Shared/ImageUploader";

interface CategoryOption { name: string; slug: string; }

const contactFields = [
  { key: "phone",     label: "Phone Number" },
  { key: "email",     label: "Email" },
  { key: "address",   label: "Address" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook",  label: "Facebook" },
  { key: "whatsapp",  label: "WhatsApp" },
  { key: "tiktok",    label: "TikTok" },
] as const;

const emptyForm = () => ({
  name: "",
  description: "",
  location: "",
  hasDelivery: false,
  ownerEmail: "",
  categories: [] as string[],
  contact: { phone: "", email: "", address: "", instagram: "", facebook: "", whatsapp: "", tiktok: "" },
});

export default function CreateBusinessPage() {
  const { getAccessTokenSilently } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm());
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data))
          setCategoryOptions(data.map((c: any) => ({ name: c.name, slug: c.slug })));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const setContact = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, contact: { ...prev.contact, [field]: value } }));

  const toggleCategory = (name: string) =>
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(name)
        ? prev.categories.filter((c) => c !== name)
        : [...prev.categories, name],
    }));

  const handleSave = async (publish: boolean) => {
    if (!form.name.trim()) { setToast("Shop name is required."); return; }
    if (!form.description.trim()) { setToast("Description is required."); return; }
    if (form.categories.length === 0) { setToast("At least one category is required."); return; }

    setIsSaving(true);
    try {
      const res = await apiFetch(
        "/api/shops",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, isPublished: publish }),
        },
        getAccessTokenSilently
      );

      if (!res.ok) throw new Error("Failed to create business");
      const shop = await res.json();
      const shopId: string = shop._id;

      if (logoFile) {
        await saveImages({ files: [logoFile], entityType: "shop", entityId: shopId, imageType: "shop-logo" }, getAccessTokenSilently);
      }
      if (heroFile) {
        await saveImages({ files: [heroFile], entityType: "shop", entityId: shopId, imageType: "shop-hero" }, getAccessTokenSilently);
      }

      setToast(publish ? "Business created and published!" : "Business saved as draft.");
      setTimeout(() => navigate("/admin/businesses"), 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setToast(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create Business</h1>
        <button
          onClick={() => navigate("/admin/businesses")}
          className="text-sm text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          ← Back to Businesses
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Shop Info */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-start gap-x-6 gap-y-4">
              <label className="font-medium sm:pt-2">Shop Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full border rounded-lg p-2"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />

              <label className="font-medium sm:pt-2">Description <span className="text-red-500">*</span></label>
              <textarea
                rows={3}
                className="w-full border rounded-lg p-2"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />

              <label className="font-medium sm:pt-2">Location</label>
              <input
                type="text"
                className="w-full border rounded-lg p-2"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              />

              <span className="hidden sm:block" />
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasDelivery}
                  onChange={(e) => setForm((p) => ({ ...p, hasDelivery: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="font-medium">Delivery available</span>
              </label>

              <div className="sm:col-span-2 border-t border-gray-100 pt-2">
                <h2 className="font-semibold">Contact Information</h2>
              </div>

              {contactFields.map(({ key, label }) => (
                <div key={key} className="contents">
                  <label className="font-medium sm:pt-2">{label}</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2"
                    value={form.contact[key]}
                    onChange={(e) => setContact(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="font-semibold">Categories <span className="text-red-500">*</span></h2>
            <div className="flex flex-wrap gap-3">
              {categoryOptions.map((cat) => (
                <label key={cat.slug} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.categories.includes(cat.name)}
                    onChange={() => toggleCategory(cat.name)}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          {/* Owner Email */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-3">
            <h2 className="font-semibold">Owner Email <span className="text-gray-400 font-normal text-sm">(optional — assign later)</span></h2>
            <p className="text-sm text-gray-500">The business owner will be able to claim and manage this page once they log in with this email.</p>
            <input
              type="email"
              placeholder="owner@example.com"
              className="w-full border rounded-lg p-2"
              value={form.ownerEmail}
              onChange={(e) => setForm((p) => ({ ...p, ownerEmail: e.target.value }))}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Logo */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="font-semibold">Logo</h2>
            <p className="text-xs text-gray-400">Square, min 200×200 px, max 1 MB</p>
            <ImageUploader
              label="Upload Logo"
              multiple={false}
              onUpload={(files) => {
                setLogoFile(files[0]);
                setLogoPreview(URL.createObjectURL(files[0]));
              }}
            />
            {logoPreview && (
              <img src={logoPreview} alt="Logo preview" className="h-24 w-24 object-contain rounded-xl border" />
            )}
          </div>

          {/* Hero */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="font-semibold">Hero Image</h2>
            <p className="text-xs text-gray-400">Landscape 16:9, min 1200×675 px, max 3 MB</p>
            <ImageUploader
              label="Upload Hero"
              multiple={false}
              onUpload={(files) => {
                setHeroFile(files[0]);
                setHeroPreview(URL.createObjectURL(files[0]));
              }}
            />
            {heroPreview && (
              <img src={heroPreview} alt="Hero preview" className="w-full h-32 object-cover rounded-xl border" />
            )}
          </div>

        </div>
      </div>

      {/* Action bar */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => void handleSave(false)}
          disabled={isSaving}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-60 cursor-pointer"
        >
          {isSaving ? "Saving..." : "Save as Draft"}
        </button>
        <button
          onClick={() => void handleSave(true)}
          disabled={isSaving}
          className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary disabled:opacity-60 cursor-pointer"
        >
          {isSaving ? "Saving..." : "Save & Publish"}
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-black px-5 py-3 text-sm text-white shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
