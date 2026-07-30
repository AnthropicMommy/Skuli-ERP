import { put } from "@vercel/blob";
import { nanoid } from "nanoid";

export async function uploadMaterial(
  file: File,
  organizationId: string
): Promise<{ url: string; pathname: string }> {
  const ext = file.name.split(".").pop() || "bin";
  const pathname = `materials/${organizationId}/${nanoid()}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type || "application/octet-stream",
  });

  return { url: blob.url, pathname };
}
