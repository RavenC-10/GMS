import { db } from "./db";
import { type Category } from "../types";

export async function getAllCategories(): Promise<Category[]> {
  return db.categories.toArray();
}
