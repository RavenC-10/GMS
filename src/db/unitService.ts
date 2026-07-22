import { db } from "./db";
import { type Unit } from "../types";

export async function getAllUnits(): Promise<Unit[]> {
  return db.units.toArray();
}
