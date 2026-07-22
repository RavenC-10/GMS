import { useState, useEffect, ReactNode, FormEvent } from "react";
import {
  ShoppingCart,
  Trash2,
  AlertTriangle,
  Calendar,
  Package,
  Users,
  Plus,
  Search,
  Minus,
  DollarSign,
  Tag,
  MapPin,
  ClipboardList,
  Bell,
  Info,
  Check
} from "lucide-react";
import { getAllItems, deleteItem, updateItem, addItem } from "../db/inventoryService";
import { saveImage, getImage } from "../db/imageService";
import { db } from "../db/db";
import { type InventoryItem, type Category, type Location, type Unit } from "../types";
import PageHeader from "../components/PageHeader";
import CustomDropdown from "../components/CustomDropdown";

function Home() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [popupType, setPopupType] = useState<"outOfStock" | "almostExpire" | "expired" | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Search & Filter state for Quick Inventory
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All Categories");
  const [selectedLocationFilter, setSelectedLocationFilter] = useState("All Locations");

  // Dropdown options loaded from Settings
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);

  // Add Item form state
  const [newName, setNewName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [newUnit, setNewUnit] = useState("pcs");
  const [newCategory, setNewCategory] = useState("Dairy");
  const [newLocation, setNewLocation] = useState("Fridge");
  const [newPrice, setNewPrice] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPurchaseDate, setNewPurchaseDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
    loadDropdownOptions();
  }, []);

  async function loadItems() {
    setLoading(true);
    let data = await getAllItems();
    if (data.length === 0) {
      const today = new Date().toISOString().split("T")[0];
      const seedItems: Omit<InventoryItem, "id">[] = [
        {
          name: "Greek Yogurt",
          brand: "Chobani",
          qty: 4,
          unit: "pcs",
          category: "Dairy",
          location: "Fridge",
          price: 5.99,
          purchaseDate: today,
          expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          desc: "High protein, strawberry flavor",
        },
        {
          name: "Fresh Whole Milk",
          brand: "Organic Valley",
          qty: 1,
          unit: "bottle",
          category: "Dairy",
          location: "Fridge",
          price: 3.49,
          purchaseDate: today,
          expiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          desc: "Keep cold, do not freeze",
        },
        {
          name: "Chicken Breast",
          brand: "Tyson",
          qty: 2,
          unit: "pack",
          category: "Meat",
          location: "Freezer",
          price: 12.99,
          purchaseDate: today,
          expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          desc: "For dinner meal prep",
        },
        {
          name: "Organic Bananas",
          brand: "Dole",
          qty: 0,
          unit: "pcs",
          category: "Fruit",
          location: "Counter",
          price: 1.99,
          purchaseDate: today,
          expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          desc: "Eat with morning cereal",
        }
      ];
      for (const item of seedItems) {
        await addItem(item);
      }
      data = await getAllItems();
    }
    setItems(data);
    setLoading(false);
  }

  async function loadDropdownOptions() {
    try {
      const cats = await db.categories.toArray();
      const locs = await db.locations.toArray();
      const uns = await db.units.toArray();

      const catNames = cats.map((c) => c.name);
      const locNames = locs.map((l) => l.name);
      const unNames = uns.map((u) => u.name);

      setCategories(catNames.length ? catNames : ["Dairy", "Meat", "Protein", "Fruit", "Bakery", "Grain", "Drink", "Seafood", "Vegetable"]);
      setLocations(locNames.length ? locNames : ["Fridge", "Freezer", "Pantry", "Cabinet", "Counter"]);
      setUnits(unNames.length ? unNames : ["pcs", "kg", "pack", "bottle", "cup", "block", "g"]);

      if (catNames.length) setNewCategory(catNames[0]);
      if (locNames.length) setNewLocation(locNames[0]);
      if (unNames.length) setNewUnit(unNames[0]);
    } catch (e) {
      console.error("Error loading settings options", e);
    }
  }

  // Add/Edit Item handler
  async function handleQuickAdd(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      let imageId: string | null = null;
      if (editingId) {
        const existingItem = items.find((i) => i.id === editingId);
        imageId = existingItem?.imageId || null;
      }
      
      if (newImageFile) {
        imageId = await saveImage(newImageFile);
      } else if (!newImagePreview) {
        imageId = null; // image cleared
      }

      const itemToSave: Omit<InventoryItem, "id"> = {
        name: newName.trim(),
        brand: newBrand.trim(),
        qty: Number(newQty) || 1,
        unit: newUnit,
        category: newCategory,
        location: newLocation,
        price: Number(newPrice) || 0,
        purchaseDate: newPurchaseDate || new Date().toISOString().split("T")[0],
        expiryDate: newExpiry,
        desc: newDesc.trim(),
        imageId: imageId,
      };

      if (editingId) {
        await updateItem(editingId, itemToSave);
        alert(`✓ ${itemToSave.name} successfully updated!`);
      } else {
        await addItem(itemToSave);
        alert(`✓ ${itemToSave.name} successfully added to stock!`);
      }
      await loadItems();

      // Reset form
      setNewName("");
      setNewBrand("");
      setNewQty("1");
      setNewPrice("");
      setNewExpiry("");
      setNewDesc("");
      setNewPurchaseDate(new Date().toISOString().split("T")[0]);
      setNewImageFile(null);
      setNewImagePreview(null);
      setEditingId(null);
      
      setIsAddOpen(false);
    } catch (error) {
      console.error(error);
      alert(editingId ? "Failed to update item." : "Failed to add item to inventory.");
    }
  }

  async function handleSelectForEdit(item: InventoryItem) {
    if (!item.id) return;
    setEditingId(item.id);
    setNewName(item.name);
    setNewBrand(item.brand || "");
    setNewQty(String(item.qty));
    setNewUnit(item.unit);
    setNewCategory(item.category);
    setNewLocation(item.location);
    setNewPrice(item.price ? String(item.price) : "");
    setNewExpiry(item.expiryDate || "");
    setNewDesc(item.desc || "");
    setNewPurchaseDate(item.purchaseDate || new Date().toISOString().split("T")[0]);
    
    if (item.imageId) {
      const dataUrl = await getImage(item.imageId);
      setNewImagePreview(dataUrl);
    } else {
      setNewImagePreview(null);
    }
    setNewImageFile(null);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setNewName("");
    setNewBrand("");
    setNewQty("1");
    setNewUnit(units[0] || "pcs");
    setNewCategory(categories[0] || "Dairy");
    setNewLocation(locations[0] || "Fridge");
    setNewPrice("");
    setNewExpiry("");
    setNewDesc("");
    setNewPurchaseDate(new Date().toISOString().split("T")[0]);
    setNewImageFile(null);
    setNewImagePreview(null);
  }

  // Adjust Quantity
  async function handleAdjustQty(id: number, currentQty: number, change: number) {
    const nextQty = Math.max(0, currentQty + change);
    await updateItem(id, { qty: nextQty });
    // Update local state directly for speed
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: nextQty } : item))
    );
  }

  // Add item to shopping list
  async function addToShoppingList(item: { name: string; brand?: string; qty: number; unit?: string }) {
    const existing = await db.shoppingList.where("name").equals(item.name).first();
    if (existing) {
      await db.shoppingList.update(existing.id!, {
        qty: existing.qty + (item.qty || 1)
      });
    } else {
      await db.shoppingList.add({
        name: item.name,
        qty: item.qty || 1,
        unit: item.unit || "pcs",
        brand: item.brand || "",
        createdAt: new Date().toISOString(),
      });
    }
    alert(`${item.name} added to shopping list`);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter calculations
  const outOfStockItems = items.filter((item) => Number(item.qty) === 0);

  const almostExpireItems = items.filter((item) => {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    const diff = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  const expiredItems = items.filter((item) => {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    return expiry < today;
  });

  const totalItems = items.length;

  // Filtered inventory list
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "All Categories" || item.category === selectedCategoryFilter;
    const matchesLocation =
      selectedLocationFilter === "All Locations" || item.location === selectedLocationFilter;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const handleDelete = async (id: number) => {
    const item = items.find((i) => i.id === id);
    if (item?.imageId) {
      await db.images.delete(item.imageId);
    }
    await deleteItem(id);
    await loadItems();
  };

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="h-full flex flex-col gap-3 text-slate-200 overflow-hidden">
      {/* HEADER */}
      <PageHeader
        title="Dashboard"
        right={
          <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-text-muted bg-bg-item border border-border-custom px-3 py-1 rounded-xl">
            <Calendar size={13} className="text-accent-custom" />
            <span>{formattedDate}</span>
          </div>
        }
      />

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-3.5 flex-1 min-h-0 min-w-0">
        
        {/* LEFT COLUMN: STAT CARDS & FAMILY DUTY BOARD */}
        <div className="flex flex-col gap-3.5 min-h-0 min-w-0">
          {/* STAT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <StatCard
              title="Total Items"
              value={totalItems}
              badgeColor="bg-sky-500/10 text-sky-500 border-sky-500/20"
              icon={<Package className="text-sky-500" size={22} />}
            />
            <StatCard
              title="Out of Stock"
              value={outOfStockItems.length}
              onClick={() => setPopupType("outOfStock")}
              badgeColor="bg-rose-500/10 text-rose-500 border-rose-500/20"
              icon={<AlertTriangle className="text-rose-500" size={22} />}
            />
            <StatCard
              title="Almost Expired"
              value={almostExpireItems.length}
              onClick={() => setPopupType("almostExpire")}
              badgeColor="bg-amber-500/10 text-amber-500 border-amber-500/20"
              icon={<AlertTriangle className="text-amber-500" size={22} />}
            />
            <StatCard
              title="Expired"
              value={expiredItems.length}
              onClick={() => setPopupType("expired")}
              badgeColor="bg-red-500/10 text-red-500 border-red-500/20"
              icon={<AlertTriangle className="text-red-500" size={22} />}
            />
          </div>

          {/* SIDE-BY-SIDE PANELS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1 min-h-0 min-w-0">
            {/* NOTIFICATION BOARD */}
            <div className="bg-bg-card border border-border-custom rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col min-h-0 min-w-0">
              <h2 className="text-sm font-semibold text-text-title border-b border-border-custom pb-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Bell className="text-accent-custom animate-pulse" size={16} />
                  <span>Notification</span>
                </div>
                <span className="text-[10px] bg-accent-custom/10 text-accent-custom border border-accent-custom/20 px-2 py-0.5 rounded-full font-bold">
                  Live
                </span>
              </h2>

              <div className="flex-1 overflow-auto mt-3 space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent min-h-0">
                {/* EXPIRED ITEMS ALERT */}
                {expiredItems.length > 0 && (
                  <div
                    onClick={() => setPopupType("expired")}
                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 p-3 rounded-2xl flex items-start gap-2.5 transition cursor-pointer"
                  >
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-red-600 dark:text-red-300">Expired Items Alert</p>
                      <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                        {expiredItems.length} {expiredItems.length === 1 ? 'item has' : 'items have'} expired. Tap to view and clean up.
                      </p>
                    </div>
                  </div>
                )}

                {/* ALMOST EXPIRED ITEMS ALERT */}
                {almostExpireItems.length > 0 && (
                  <div
                    onClick={() => setPopupType("almostExpire")}
                    className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 p-3 rounded-2xl flex items-start gap-2.5 transition cursor-pointer"
                  >
                    <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={14} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-300">Expiring Soon Alert</p>
                      <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                        {almostExpireItems.length} {almostExpireItems.length === 1 ? 'item is' : 'items are'} expiring within 7 days. Tap to check.
                      </p>
                    </div>
                  </div>
                )}

                {/* OUT OF STOCK ALERT */}
                {outOfStockItems.length > 0 && (
                  <div
                    onClick={() => setPopupType("outOfStock")}
                    className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 p-3 rounded-2xl flex items-start gap-2.5 transition cursor-pointer"
                  >
                    <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={14} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">Out of Stock Alert</p>
                      <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                        {outOfStockItems.length} key {outOfStockItems.length === 1 ? 'item is' : 'items are'} depleted. Tap to add to shopping list.
                      </p>
                    </div>
                  </div>
                )}

                {/* HOUSEHOLD NOTES / ANNOUNCEMENTS */}
                <div className="bg-bg-item border border-border-custom p-3 rounded-2xl flex items-start gap-2.5">
                  <Info className="text-accent-custom shrink-0 mt-0.5" size={14} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-text-title">Weekly Kitchen Announcement</p>
                    <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                      🛒 Grocery replenishment is scheduled for every Saturday. Please update your requested items in the Shopping List before then!
                    </p>
                  </div>
                </div>

                {/* STORAGE TIP */}
                <div className="bg-bg-item border border-border-custom p-3 rounded-2xl flex items-start gap-2.5">
                  <Info className="text-emerald-400 shrink-0 mt-0.5" size={14} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white">Smart Pantry Tip</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      💡 Keep tomatoes, onions, and potatoes in a cool, dark, dry space instead of the refrigerator to preserve flavor!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ADD PANTRY ITEM BOX */}
            <div className={`bg-bg-card border rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col min-h-0 min-w-0 transition-all duration-300 ${editingId !== null ? "border-accent-custom/40 shadow-accent-custom/10" : "border-border-custom"}`}>
              <h2 className="text-sm font-semibold text-text-title border-b border-border-custom pb-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Plus className="text-accent-custom" size={16} />
                  <span>{editingId !== null ? "Edit Stock Item" : "Quick Add"}</span>
                </div>
                {editingId !== null && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-[10px] text-text-muted hover:text-accent-custom bg-bg-item border border-border-custom px-2 py-0.5 rounded-md transition cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </h2>

              <form onSubmit={handleQuickAdd} className="space-y-4 mt-3 overflow-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {/* TOP SECTION (IMAGE LEFT, CONTROLS RIGHT) */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* IMAGE (LEFT SIDE) */}
                  <div className="w-full sm:w-28 shrink-0 flex flex-col items-center sm:items-start">
                    <label className="text-[10px] text-text-muted font-semibold mb-1 block self-start">Item Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      id="quick-add-image"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setNewImageFile(file);
                        const reader = new FileReader();
                        reader.onload = () => {
                          setNewImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <label htmlFor="quick-add-image" className="cursor-pointer block w-full">
                      <div className="w-full h-24 sm:h-28 rounded-xl border border-border-custom bg-bg-item overflow-hidden flex flex-col items-center justify-center hover:bg-bg-card transition shadow-inner">
                        {newImagePreview ? (
                          <img src={newImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-1.5 flex flex-col items-center justify-center">
                            <span className="text-lg">📸</span>
                            <span className="text-text-muted text-[9px] font-semibold mt-0.5">Click to upload</span>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* RIGHT SIDE OF TOP SECTION */}
                  <div className="flex-1 flex flex-col gap-3">
                    {/* ITEM NAME */}
                    <div>
                      <label className="text-[10px] text-text-muted font-semibold mb-1 block">Item Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Greek Yogurt, Whole Milk"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full h-9 px-3 border border-border-custom bg-bg-item rounded-xl text-xs text-text-title focus:outline-none focus:border-accent-custom placeholder:text-text-muted"
                      />
                    </div>

                    {/* BRAND */}
                    <div>
                      <label className="text-[10px] text-text-muted font-semibold mb-1 block">Brand / Maker</label>
                      <input
                        type="text"
                        placeholder="e.g. Nestle, Dutch Lady"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        className="w-full h-9 px-3 border border-border-custom bg-bg-item rounded-xl text-xs text-text-title focus:outline-none focus:border-accent-custom placeholder:text-text-muted"
                      />
                    </div>
                  </div>
                </div>

                {/* CATEGORY + LOCATION */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-text-muted font-semibold mb-1 block">Category</label>
                    <CustomDropdown
                      options={categories}
                      value={newCategory}
                      onChange={setNewCategory}
                      compact
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted font-semibold mb-1 block">Location</label>
                    <CustomDropdown
                      options={locations}
                      value={newLocation}
                      onChange={setNewLocation}
                      compact
                    />
                  </div>
                </div>

                {/* BOTTOM ROW (QUANTITY+UNIT, PRICE, PURCHASE DATE, EXPIRY DATE) */}
                <div className="grid grid-cols-2 gap-3">
                  {/* QUANTITY + UNIT */}
                  <div>
                    <label className="text-[10px] text-text-muted font-semibold mb-1 block">Quantity & Unit</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        min="0"
                        required
                        value={newQty}
                        onChange={(e) => setNewQty(e.target.value)}
                        className="w-2/3 h-9 px-3 border border-border-custom bg-bg-item rounded-xl text-xs text-text-title focus:outline-none focus:border-accent-custom"
                      />
                      <div className="w-1/3">
                        <CustomDropdown
                          options={units}
                          value={newUnit}
                          onChange={setNewUnit}
                          compact
                          placeholder="Unit"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PRICE */}
                  <div>
                    <label className="text-[10px] text-text-muted font-semibold mb-1 block">Price ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full h-9 pl-7 pr-3 border border-border-custom bg-bg-item rounded-xl text-xs text-text-title focus:outline-none focus:border-accent-custom placeholder:text-text-muted"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* PURCHASE DATE */}
                  <div>
                    <label className="text-[10px] text-text-muted font-semibold mb-1 block">Purchase Date</label>
                    <input
                      type="date"
                      value={newPurchaseDate}
                      onChange={(e) => setNewPurchaseDate(e.target.value)}
                      className="w-full h-9 px-3 border border-border-custom bg-bg-item rounded-xl text-xs text-text-title focus:outline-none focus:border-accent-custom"
                    />
                  </div>

                  {/* EXPIRY DATE */}
                  <div>
                    <label className="text-[10px] text-text-muted font-semibold mb-1 block">Expiry Date</label>
                    <input
                      type="date"
                      value={newExpiry}
                      onChange={(e) => setNewExpiry(e.target.value)}
                      className="w-full h-9 px-3 border border-border-custom bg-bg-item rounded-xl text-xs text-text-title focus:outline-none focus:border-accent-custom"
                    />
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="text-[10px] text-text-muted font-semibold mb-1 block">Description / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Keep chilled, buy more next week..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full h-9 px-3 border border-border-custom bg-bg-item rounded-xl text-xs text-text-title focus:outline-none focus:border-accent-custom placeholder:text-text-muted"
                  />
                </div>

                {/* SAVE / ADD BUTTON */}
                <div className="flex gap-2 mt-2 shrink-0">
                  {editingId !== null && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="w-1/3 bg-bg-item hover:bg-bg-card text-text-title h-9 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer border border-border-custom"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!newName.trim()}
                    className={`${editingId !== null ? "w-2/3" : "w-full"} bg-accent-custom hover:bg-accent-custom-hover disabled:bg-bg-item disabled:text-text-muted disabled:cursor-not-allowed disabled:shadow-none text-white h-9 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-accent-custom/15`}
                  >
                    {editingId !== null ? <Check size={14} /> : <Plus size={14} />}
                    <span>{editingId !== null ? "Save Changes" : "Add to Stock"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK INVENTORY */}
        <div className="bg-bg-card border border-border-custom rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col min-h-0 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-custom pb-3 gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-accent-custom" size={18} />
              <h2 className="text-base font-semibold text-text-title">Inventory</h2>
            </div>
            <span className="text-xs text-text-muted font-medium">
              ({filteredItems.length} items)
            </span>
          </div>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search quick stock..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-4 border border-border-custom bg-bg-item rounded-xl text-xs text-text-title focus:outline-none focus:border-accent-custom placeholder:text-text-muted"
              />
            </div>

            {/* Category Filter */}
            <CustomDropdown
              options={["All Categories", ...categories]}
              value={selectedCategoryFilter}
              onChange={setSelectedCategoryFilter}
              compact
            />

            {/* Location Filter */}
            <CustomDropdown
              options={["All Locations", ...locations]}
              value={selectedLocationFilter}
              onChange={setSelectedLocationFilter}
              compact
            />
          </div>

          {/* QUICK INVENTORY LIST */}
          <div className="flex-1 overflow-auto mt-3 space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent min-h-0">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
              {loading ? (
                <p className="text-text-muted text-xs py-6 text-center">Loading grocery inventory...</p>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-xs text-text-muted font-medium bg-bg-item border border-dashed border-border-custom rounded-2xl">
                  🔎 No matched items found. Try different filters or add one on the right!
                </div>
              ) : (
                  filteredItems.map((item) => (
                    <HomeInventoryItem
                      key={item.id}
                      item={item}
                      onClick={() => handleSelectForEdit(item)}
                    />
                  ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* POPUP MODALS */}
      {popupType === "outOfStock" && (
        <ItemListModal
          title="Out of Stock Items"
          items={outOfStockItems}
          loading={loading}
          onClose={() => setPopupType(null)}
          onDelete={handleDelete}
          onAddToShoppingList={addToShoppingList}
        />
      )}

      {popupType === "almostExpire" && (
        <ItemListModal
          title="Almost Expired Items"
          items={almostExpireItems}
          loading={loading}
          onClose={() => setPopupType(null)}
          onDelete={handleDelete}
          onAddToShoppingList={addToShoppingList}
        />
      )}

      {popupType === "expired" && (
        <ItemListModal
          title="Expired Items"
          items={expiredItems}
          loading={loading}
          onClose={() => setPopupType(null)}
          onDelete={handleDelete}
          onAddToShoppingList={addToShoppingList}
        />
      )}

      {/* ADD ITEM MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#141620] rounded-3xl p-5 shadow-2xl border border-white/10 flex flex-col max-h-[90vh] text-slate-200">
            <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2 shrink-0">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Plus className="text-emerald-400" size={16} />
                <span>Quick Add to Pantry</span>
              </h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleQuickAdd} className="space-y-3 overflow-auto pr-1 py-1 flex-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {/* Item Name */}
              <div>
                <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Greek Yogurt, Whole Milk"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-9 px-3 border border-white/10 bg-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Brand / Manufacturer</label>
                <input
                  type="text"
                  placeholder="e.g. Nestle, Dutch Lady"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  className="w-full h-9 px-3 border border-white/10 bg-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                />
              </div>

              {/* Qty & Unit row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="w-full h-9 px-3 border border-white/10 bg-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Unit</label>
                  <CustomDropdown
                    options={units}
                    value={newUnit}
                    onChange={setNewUnit}
                    compact
                  />
                </div>
              </div>

              {/* Category & Location row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Category</label>
                  <CustomDropdown
                    options={categories}
                    value={newCategory}
                    onChange={setNewCategory}
                    compact
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Location</label>
                  <CustomDropdown
                    options={locations}
                    value={newLocation}
                    onChange={setNewLocation}
                    compact
                  />
                </div>
              </div>

              {/* Price & Expiry Date row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Price ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full h-9 pl-7 pr-3 border border-white/10 bg-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Expiry Date</label>
                  <input
                    type="date"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full h-9 px-3 border border-white/10 bg-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Description / Notes */}
              <div>
                <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Description / Notes</label>
                <textarea
                  placeholder="Additional item notes..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full h-14 px-3 py-1.5 border border-white/10 bg-[#0F111A] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600 resize-none"
                />
              </div>

              {/* Add Button */}
              <button
                type="submit"
                disabled={!newName.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none text-black h-9 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-emerald-500/15 shrink-0"
              >
                <Plus size={14} />
                <span>Add to Stock</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODALS */}
      {popupType === "outOfStock" && (
        <ItemListModal
          title="Out of Stock Items"
          items={outOfStockItems}
          loading={loading}
          onClose={() => setPopupType(null)}
          onDelete={handleDelete}
          onAddToShoppingList={addToShoppingList}
        />
      )}

      {popupType === "almostExpire" && (
        <ItemListModal
          title="Almost Expired Items"
          items={almostExpireItems}
          loading={loading}
          onClose={() => setPopupType(null)}
          onDelete={handleDelete}
          onAddToShoppingList={addToShoppingList}
        />
      )}

      {popupType === "expired" && (
        <ItemListModal
          title="Expired Items"
          items={expiredItems}
          loading={loading}
          onClose={() => setPopupType(null)}
          onDelete={handleDelete}
          onAddToShoppingList={addToShoppingList}
        />
      )}
    </div>
  );
}

/* =======================================
   STAT CARD COMPONENT
   ======================================= */
interface StatCardProps {
  title: string;
  value: number;
  onClick?: () => void;
  badgeColor?: string;
  icon?: ReactNode;
}

function StatCard({ title, value, onClick, badgeColor, icon }: StatCardProps) {
  const activeBadgeColor = badgeColor || "bg-sky-500/10 text-sky-500 border-sky-500/20";
  return (
    <div
      onClick={onClick}
      className={`bg-bg-card border border-border-custom rounded-2xl p-5 sm:p-6 flex items-center justify-between shadow-md transition-all duration-300 relative overflow-hidden group min-h-[96px] sm:min-h-[108px]
        ${onClick ? "cursor-pointer hover:scale-[1.02] hover:border-accent-custom/40" : ""}
      `}
    >
      <div className="min-w-0 flex-1">
        <p className="text-text-muted text-xs font-bold uppercase tracking-wider truncate">{title}</p>
        <h2 className="text-2xl sm:text-3xl font-black mt-2 text-text-title leading-none">
          {value}
        </h2>
      </div>
      <div className={`p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 shrink-0 ml-3 ${activeBadgeColor} group-hover:scale-110 shadow-sm`}>
        {icon}
      </div>
    </div>
  );
}

/* =======================================
   MODAL LIST ROW COMPONENT
   ======================================= */
interface ItemCardProps {
  key?: any;
  item: InventoryItem;
  onDelete: () => void;
  onAddToShoppingList: () => void;
}

function ItemCard({ item, onDelete, onAddToShoppingList }: ItemCardProps) {
  return (
    <div className="bg-bg-item border border-border-custom rounded-2xl px-4 py-3 flex items-center justify-between hover:shadow-md transition">
      <div className="min-w-0 flex-1 pr-3">
        <p className="font-semibold text-text-title truncate text-sm">
          {item.name}
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          {item.brand ? `${item.brand} • ` : ""}{item.qty} {item.unit}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onAddToShoppingList}
          className="p-2 rounded-xl bg-accent-custom hover:bg-accent-custom-hover text-white transition flex items-center justify-center cursor-pointer"
          title="Add to Shopping List"
        >
          <ShoppingCart size={15} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition flex items-center justify-center cursor-pointer"
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

/* =======================================
   MODAL COMPONENT
   ======================================= */
interface ItemListModalProps {
  title: string;
  items: InventoryItem[];
  loading: boolean;
  onClose: () => void;
  onDelete: (id: number) => void;
  onAddToShoppingList: (item: { name: string; brand?: string; qty: number; unit?: string }) => void;
}

function ItemListModal({
  title,
  items,
  loading,
  onClose,
  onDelete,
  onAddToShoppingList,
}: ItemListModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-bg-card rounded-3xl p-6 shadow-2xl border border-border-custom flex flex-col max-h-[85vh] text-text-main">
        <div className="flex justify-between items-center mb-4 border-b border-border-custom pb-3">
          <h2 className="text-xl font-semibold text-text-title">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-accent-custom hover:bg-accent-custom-hover text-white text-sm font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="space-y-3 overflow-auto flex-1 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {loading ? (
            <p className="text-center text-text-muted py-6">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-center text-text-muted py-8 italic font-medium">No items found.</p>
          ) : (
            items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onDelete={() => item.id !== undefined && onDelete(item.id)}
                onAddToShoppingList={() => onAddToShoppingList({ name: item.name, brand: item.brand, qty: 1, unit: item.unit })}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* =======================================
   HOME INVENTORY ITEM COMPONENT
   ======================================= */
interface HomeInventoryItemProps {
  key?: any;
  item: InventoryItem;
  onClick: () => void;
}

function HomeInventoryItem({ item, onClick }: HomeInventoryItemProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const url = await getImage(item.imageId);
      if (mounted) {
        setImgUrl(url);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [item.imageId]);

  const isOutOfStock = Number(item.qty) === 0;

  return (
    <div
      onClick={onClick}
      title="Click to edit item"
      className={`relative bg-bg-item border rounded-3xl p-3 hover:shadow-md transition-all duration-300 flex flex-col h-64 justify-between cursor-pointer select-none hover:scale-[1.02]
        ${isOutOfStock ? "border-rose-500/20 bg-rose-500/10" : "border-border-custom"}
      `}
    >
        {/* IMAGE */}
        <div className="h-32 bg-bg-card rounded-2xl mb-2 overflow-hidden flex items-center justify-center border border-border-custom">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-lg">🍏</span>
          )}
        </div>

        {/* ITEM NAME */}
        <div className="text-center font-semibold text-text-title truncate px-1">
          {item.name}
        </div>

      {/* QUANTITY */}
      <div className="text-center text-xs text-text-muted font-medium">
        Qty: {item.qty} {item.unit}
      </div>
    </div>
  );
}

export default Home;
