import { db } from "./db";

export async function saveImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
      try {
        await db.images.put({ id, dataUrl });
        resolve(id);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function getImage(id: string | null | undefined): Promise<string | null> {
  if (!id) return null;
  const image = await db.images.get(id);
  return image ? image.dataUrl : null;
}
