import { ApiError, apiRequest } from "@/lib/api-client";
import type { CreateImageInput, ImageUploadPresign, MenuItemImage, RestaurantImage } from "@/types/restaurant";

export type ImageUploadStage = "Preparing upload..." | "Uploading image..." | "Saving image...";
export const IMAGE_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImageFile(file: File): void {
  if (!IMAGE_CONTENT_TYPES.includes(file.type)) {
    throw new ApiError("Choose a JPEG, PNG or WebP image.", 400);
  }
  if (file.size === 0) {
    throw new ApiError("The selected image is empty. Choose another file.", 400);
  }
}

export async function uploadImage(
  resource: "restaurants" | "menu-items",
  resourceId: number,
  file: File,
  metadata: Omit<CreateImageInput, "objectKey">,
  token: string,
  onStage: (stage: ImageUploadStage) => void,
): Promise<RestaurantImage | MenuItemImage> {
  validateImageFile(file);
  const path = `/${resource}/${resourceId}/images`;
  onStage("Preparing upload...");
  const { uploadUrl, objectKey } = await apiRequest<ImageUploadPresign>(`${path}/presign`, {
    method: "POST",
    token,
    body: JSON.stringify({ fileName: file.name, contentType: file.type }),
  });

  onStage("Uploading image...");
  let response: Response;
  try {
    response = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
      credentials: "omit",
    });
  } catch {
    throw new ApiError("Unable to upload the image. Check your connection and try again.", 0);
  }
  if (!response.ok) {
    throw new ApiError("Image upload failed. Try again to request a new upload link.", response.status);
  }

  onStage("Saving image...");
  return apiRequest<RestaurantImage | MenuItemImage>(path, {
    method: "POST",
    token,
    body: JSON.stringify({ objectKey, ...metadata }),
  });
}
