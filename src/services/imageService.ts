import { apiFetch, type GetToken } from "./api";

export interface SaveImageOptions {
  files: File[];
  entityType: "shop" | "product" | "featured-shop" | "homepage-slide";
  entityId?: string;
  imageType:
    | "shop-logo"
    | "shop-hero"
    | "gallery"
    | "product"
    | "featured-shop"
    | "homepage-slide";
  extraData?: {
    order?: number;
    price?: number;
    description?: string;
    featured?: boolean;
  };
}

export async function saveImages(
  options: SaveImageOptions,
  getToken?: GetToken
) {
  const formData = new FormData();

  options.files.forEach((file) => {
    formData.append("files", file);
  });

  formData.append("entityType", options.entityType);
  formData.append("imageType", options.imageType);

  if (options.entityId) {
    formData.append("entityId", options.entityId);
  }

  if (options.extraData) {
    formData.append("extraData", JSON.stringify(options.extraData));
  }

  const res = await apiFetch(
    "/api/images",
    {
      method: "POST",
      body: formData,
    },
    getToken
  );

  if (!res.ok) {
    throw new Error("Image upload failed");
  }

  return res.json(); // returns saved images
}

export async function updateShopGalleryImage(
  shopId: string,
  publicId: string,
  updates: {
    order: number;
    price?: number;
    description?: string;
    featured?: boolean;
  },
  getToken?: GetToken
) {
  const res = await apiFetch(
    `/api/images/shops/${shopId}/gallery/${encodeURIComponent(publicId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: updates.order,
        price: updates.price ?? null,
        description: updates.description ?? "",
        featured: updates.featured ?? false,
      }),
    },
    getToken
  );

  if (!res.ok) {
    throw new Error("Gallery image update failed");
  }

  return res.json();
}

export async function deleteShopGalleryImage(
  shopId: string,
  publicId: string,
  getToken?: GetToken
) {
  const res = await apiFetch(
    `/api/images/shops/${shopId}/gallery/${encodeURIComponent(publicId)}`,
    { method: "DELETE" },
    getToken
  );

  if (!res.ok) {
    throw new Error("Gallery image delete failed");
  }
}
