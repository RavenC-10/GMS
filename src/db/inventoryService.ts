import { db } from "./db";
import { type InventoryItem } from "../types";

export async function getAllItems(): Promise<InventoryItem[]> {
  return db.items.toArray();
}

export async function addItem(item: Omit<InventoryItem, "id">): Promise<InventoryItem> {
  const id = await db.items.add(item as InventoryItem);
  return { ...item, id };
}

export async function updateItem(id: number, updated: Partial<InventoryItem>): Promise<number> {
  return db.items.update(id, updated);
}

export async function deleteItem(id: number): Promise<void> {
  await db.items.delete(id);
}
