import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import TagInput from "../components/TagInput";
import { Sliders } from "lucide-react";
import { db } from "../db/db";
import { addItem } from "../db/inventoryService";
import { type Category, type Location, type Unit, type InventoryItem } from "../types";
import { useTheme } from "../context/ThemeContext";

function Settings() {
  const { theme, setTheme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const testItems: Omit<InventoryItem, "id">[] = [
    {
      name: "Milk",
      qty: 2,
      unit: "bottle",
      desc: "Fresh milk",
      category: "Dairy",
      brand: "Dutch Lady",
      location: "Fridge",
      price: 6.5,
      purchaseDate: "2026-06-01",
      expiryDate: "2026-06-05",
      imageId: null,
    },
    {
      name: "Eggs",
      qty: 12,
      unit: "pcs",
      desc: "Chicken eggs",
      category: "Protein",
      brand: "Farm Fresh",
      location: "Fridge",
      price: 12,
      purchaseDate: "2026-05-28",
      expiryDate: "2026-06-08",
      imageId: null,
    },
    {
      name: "Chicken Breast",
      qty: 1,
      unit: "kg",
      desc: "Frozen chicken breast",
      category: "Meat",
      brand: "Ayamas",
      location: "Freezer",
      price: 18.9,
      purchaseDate: "2026-05-20",
      expiryDate: "2026-05-30",
      imageId: null,
    },
    {
      name: "Yogurt",
      qty: 6,
      unit: "cup",
      desc: "Greek yogurt",
      category: "Dairy",
      brand: "Nestle",
      location: "Fridge",
      price: 5.5,
      purchaseDate: "2026-05-25",
      expiryDate: "2026-06-03",
      imageId: null,
    },
    {
      name: "Cheddar Cheese",
      qty: 1,
      unit: "block",
      desc: "Cheddar cheese",
      category: "Dairy",
      brand: "Kraft",
      location: "Fridge",
      price: 9.9,
      purchaseDate: "2026-05-15",
      expiryDate: "2026-06-20",
      imageId: null,
    },
    {
      name: "Apple",
      qty: 8,
      unit: "pcs",
      desc: "Red apples",
      category: "Fruit",
      brand: "Washington",
      location: "Fridge",
      price: 7.5,
      purchaseDate: "2026-05-22",
      expiryDate: "2026-05-29",
      imageId: null,
    },
    {
      name: "Orange",
      qty: 10,
      unit: "pcs",
      desc: "Fresh oranges",
      category: "Fruit",
      brand: "Sunkist",
      location: "Fridge",
      price: 8,
      purchaseDate: "2026-05-30",
      expiryDate: "2026-06-10",
      imageId: null,
    },
    {
      name: "Banana",
      qty: 6,
      unit: "pcs",
      desc: "Ripe bananas",
      category: "Fruit",
      brand: "Local Farm",
      location: "Counter",
      price: 4.5,
      purchaseDate: "2026-05-28",
      expiryDate: "2026-06-02",
      imageId: null,
    },
    {
      name: "Bread",
      qty: 1,
      unit: "pack",
      desc: "Wholemeal bread",
      category: "Bakery",
      brand: "Gardenia",
      location: "Cabinet",
      price: 4.2,
      purchaseDate: "2026-06-01",
      expiryDate: "2026-06-06",
      imageId: null,
    },
    {
      name: "Butter",
      qty: 2,
      unit: "block",
      desc: "Salted butter",
      category: "Dairy",
      brand: "Anchor",
      location: "Fridge",
      price: 8.9,
      purchaseDate: "2026-05-10",
      expiryDate: "2026-07-15",
      imageId: null,
    },
    {
      name: "Rice",
      qty: 5,
      unit: "kg",
      desc: "Jasmine rice",
      category: "Grain",
      brand: "Jasmine Gold",
      location: "Pantry",
      price: 25,
      purchaseDate: "2026-05-01",
      expiryDate: "2027-05-01",
      imageId: null,
    },
    {
      name: "Pasta",
      qty: 4,
      unit: "pack",
      desc: "Spaghetti pasta",
      category: "Grain",
      brand: "Barilla",
      location: "Pantry",
      price: 8,
      purchaseDate: "2026-05-12",
      expiryDate: "2027-02-15",
      imageId: null,
    },
    {
      name: "Coffee Beans",
      qty: 2,
      unit: "pack",
      desc: "Arabica coffee beans",
      category: "Drink",
      brand: "Nescafe",
      location: "Cabinet",
      price: 15,
      purchaseDate: "2026-05-05",
      expiryDate: "2027-05-05",
      imageId: null,
    },
    {
      name: "Orange Juice",
      qty: 3,
      unit: "bottle",
      desc: "Orange juice",
      category: "Drink",
      brand: "Minute Maid",
      location: "Fridge",
      price: 6.9,
      purchaseDate: "2026-05-20",
      expiryDate: "2026-06-25",
      imageId: null,
    },
    {
      name: "Frozen Fish",
      qty: 2,
      unit: "pcs",
      desc: "Frozen fish fillet",
      category: "Seafood",
      brand: "SeaFresh",
      location: "Freezer",
      price: 14,
      purchaseDate: "2026-05-18",
      expiryDate: "2026-05-22",
      imageId: null,
    },
  ];

  useEffect(() => {
    loadAll();
  }, []);

  async function loadTable<T>(table: "categories" | "locations" | "units", setter: (val: T[]) => void) {
    const data = await db[table].toArray();
    setter(data as T[]);
  }

  async function loadAll() {
    await loadTable<Category>("categories", setCategories);
    await loadTable<Location>("locations", setLocations);
    await loadTable<Unit>("units", setUnits);
  }

  async function seedData() {
    const confirmSeed = window.confirm("This will clear existing items and seed 15 realistic groceries. Proceed?");
    if (!confirmSeed) return;

    try {
      await db.items.clear();
      for (const item of testItems) {
        await addItem(item);
      }
      alert("Test data successfully restored!");
    } catch (e) {
      console.error(e);
      alert("Error seeding data.");
    }
  }

  async function clearAllData() {
    const confirmClear = window.confirm("Are you sure you want to completely clear all inventory items, images, and your shopping list?");
    if (!confirmClear) return;

    try {
      await db.items.clear();
      await db.shoppingList.clear();
      await db.images.clear();
      alert("All inventory items and shopping list data have been cleared.");
    } catch (e) {
      console.error(e);
      alert("Error clearing data.");
    }
  }

  async function exportData() {
    try {
      const items = await db.items.toArray();
      const shoppingList = await db.shoppingList.toArray();
      const settings = {
        categories: await db.categories.toArray(),
        locations: await db.locations.toArray(),
        units: await db.units.toArray(),
      };

      const exportObj = {
        exportedAt: new Date().toISOString(),
        items,
        shoppingList,
        settings,
      };

      const dataStr = JSON.stringify(exportObj, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = "groceries_data_backup.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error exporting backup.");
    }
  }

  return (
    <div className="h-full flex flex-col gap-6 text-text-main overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {/* TITLE */}
      <PageHeader
        title="Settings"
        right={
          <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-text-muted bg-white/5 border border-border-custom px-3 py-1.5 rounded-xl">
            <Sliders size={14} className="text-accent-custom" />
            <span>Preferences</span>
          </div>
        }
      />

      {/* THEME SELECTION */}
      <div className="bg-bg-card border border-border-custom rounded-3xl p-6 shadow-xl text-text-main flex flex-col gap-4">
        <h2 className="text-xl font-bold text-text-title border-b border-border-custom pb-2 flex items-center gap-2">
          🎨 Palette & Appearance
        </h2>
        <p className="text-sm text-text-muted leading-relaxed">
          Choose a visual theme that suits your mood and environment.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          {/* DARK THEME */}
          <button
            onClick={() => setTheme("dark")}
            className={`flex flex-col gap-3 p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 select-none group
              ${
                theme === "dark"
                  ? "border-emerald-500/50 bg-[#0F111A]/85 shadow-[0_0_15px_rgba(16,185,129,0.08)] scale-[1.02]"
                  : "border-border-custom bg-[#0F111A]/30 hover:border-border-custom/80 hover:bg-[#0F111A]/50"
              }
            `}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-sm text-text-title group-hover:text-emerald-400 transition-colors">
                Dark Mode
              </span>
              {theme === "dark" && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            {/* Swatch preview */}
            <div className="flex items-center gap-1.5 h-6 w-full rounded-lg bg-[#0A0B10] p-1 border border-white/5">
              <div className="w-3 h-3 rounded bg-[#141620] border border-white/5" />
              <div className="w-3 h-3 rounded bg-[#10b981]" />
              <div className="w-3 h-3 rounded bg-white" />
            </div>
          </button>

          {/* LIGHT THEME */}
          <button
            onClick={() => setTheme("light")}
            className={`flex flex-col gap-3 p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 select-none group
              ${
                theme === "light"
                  ? "border-emerald-600/50 bg-white shadow-[0_0_15px_rgba(5,150,105,0.08)] scale-[1.02]"
                  : "border-border-custom bg-white/40 hover:border-border-custom/80 hover:bg-white/60"
              }
            `}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-sm text-slate-800 group-hover:text-emerald-600 transition-colors">
                Light Mode
              </span>
              {theme === "light" && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              )}
            </div>
            {/* Swatch preview */}
            <div className="flex items-center gap-1.5 h-6 w-full rounded-lg bg-slate-100 p-1 border border-slate-200">
              <div className="w-3 h-3 rounded bg-white border border-slate-200" />
              <div className="w-3 h-3 rounded bg-[#059669]" />
              <div className="w-3 h-3 rounded bg-slate-800" />
            </div>
          </button>

          {/* WARM THEME */}
          <button
            onClick={() => setTheme("warm")}
            className={`flex flex-col gap-3 p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 select-none group
              ${
                theme === "warm"
                  ? "border-amber-700/50 bg-[#fbf9f4] shadow-[0_0_15px_rgba(180,83,9,0.08)] scale-[1.02]"
                  : "border-border-custom bg-[#fbf9f4]/40 hover:border-border-custom/80 hover:bg-[#fbf9f4]/60"
              }
            `}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-sm text-[#4a3728] group-hover:text-amber-700 transition-colors">
                Warm Cream
              </span>
              {theme === "warm" && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-700 animate-pulse" />
              )}
            </div>
            {/* Swatch preview */}
            <div className="flex items-center gap-1.5 h-6 w-full rounded-lg bg-[#f7f1e5] p-1 border border-[#ebd9c4]">
              <div className="w-3 h-3 rounded bg-white border border-[#ebd9c4]" />
              <div className="w-3 h-3 rounded bg-[#b45309]" />
              <div className="w-3 h-3 rounded bg-[#2c1b0f]" />
            </div>
          </button>
        </div>
      </div>

      {/* HOME SETTINGS */}
      <div className="bg-bg-card border border-border-custom rounded-3xl p-6 shadow-xl text-text-main flex flex-col gap-6">
        <h2 className="text-xl font-bold text-text-title border-b border-border-custom pb-2 flex items-center gap-2">
          🏷️ Grocery Classification Properties
        </h2>

        <TagInput
          label="Location"
          values={locations}
          setValues={(vals) => setLocations(vals as Location[])}
          onAdd={async (name) => {
            await db.locations.add({ name });
          }}
          onUpdate={async (id, name) => {
            await db.locations.update(id, { name });
          }}
          onDelete={async (id) => {
            await db.locations.delete(id);
          }}
        />

        <TagInput
          label="Category"
          values={categories}
          setValues={(vals) => setCategories(vals as Category[])}
          onAdd={async (name) => {
            await db.categories.add({ name });
          }}
          onUpdate={async (id, name) => {
            await db.categories.update(id, { name });
          }}
          onDelete={async (id) => {
            await db.categories.delete(id);
          }}
        />

        <TagInput
          label="Unit"
          values={units}
          setValues={(vals) => setUnits(vals as Unit[])}
          onAdd={async (name) => {
            await db.units.add({ name });
          }}
          onUpdate={async (id, name) => {
            await db.units.update(id, { name });
          }}
          onDelete={async (id) => {
            await db.units.delete(id);
          }}
        />
      </div>

      {/* DATA SETTINGS */}
      <div className="bg-bg-card border border-border-custom rounded-3xl p-6 shadow-xl text-text-main">
        <h2 className="text-xl font-bold mb-4 text-text-title border-b border-border-custom pb-2 flex items-center gap-2">
          🛡️ Data Control panel
        </h2>
        <p className="text-sm mb-6 text-text-muted leading-relaxed">
          Manage your client-side IndexedDB database. You can clear your stock, export a full backup file, or restore realistic preset products.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={clearAllData}
            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer shadow-sm"
          >
            Clear All Data
          </button>

          <button
            onClick={seedData}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer shadow-lg shadow-emerald-500/15"
          >
            Restore Demo Data
          </button>

          <button
            onClick={exportData}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer shadow-lg shadow-emerald-500/15"
          >
            Export Backup (.json)
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
