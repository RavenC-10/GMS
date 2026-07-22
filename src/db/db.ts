import Dexie, { type Table } from "dexie";
import {
  type ShoppingListItem,
  type Category,
  type Location,
  type Unit,
  type ImageStore,
  type InventoryItem,
} from "../types";

class GroceriesDB extends Dexie {
  shoppingList!: Table<ShoppingListItem>;
  categories!: Table<Category>;
  locations!: Table<Location>;
  units!: Table<Unit>;
  images!: Table<ImageStore>;
  items!: Table<InventoryItem>;

  constructor() {
    super("GroceriesDB");
    this.version(1).stores({
      shoppingList: "++id, name, createdAt",
      categories: "++id, &name",
      locations: "++id, &name",
      units: "++id, &name",
      images: "id",
      items: "++id, name, category, location, expiryDate",
    });
  }
}

export const db = new GroceriesDB();

// Populate initial data if database is empty
db.on("populate", () => {
  db.categories.bulkAdd([
    { name: "Dairy" },
    { name: "Meat" },
    { name: "Protein" },
    { name: "Fruit" },
    { name: "Bakery" },
    { name: "Grain" },
    { name: "Drink" },
    { name: "Seafood" },
    { name: "Vegetable" },
  ]);
  db.locations.bulkAdd([
    { name: "Fridge" },
    { name: "Freezer" },
    { name: "Pantry" },
    { name: "Cabinet" },
    { name: "Counter" },
  ]);
  db.units.bulkAdd([
    { name: "pcs" },
    { name: "kg" },
    { name: "pack" },
    { name: "bottle" },
    { name: "cup" },
    { name: "block" },
    { name: "g" },
  ]);
});
