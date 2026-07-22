import { db } from "./db";
import { type Location } from "../types";

export async function getAllLocations(): Promise<Location[]> {
  return db.locations.toArray();
}
