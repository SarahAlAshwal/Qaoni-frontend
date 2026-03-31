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
