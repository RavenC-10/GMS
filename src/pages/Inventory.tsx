import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { ShoppingCart, Trash2, Plus, Edit2, Check } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDropdown from "../components/CustomDropdown";
import { db } from "../db/db";
import { addItem, getAllItems, deleteItem, updateItem } from "../db/inventoryService";
import { saveImage, getImage } from "../db/imageService";
import { type InventoryItem, type Category, type Location, type Unit } from "../types";

function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // stores item names

  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartItemsDraft, setCartItemsDraft] = useState<{ name: string; qty: number; unit?: string }[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    loadItems();
    loadDropdowns();
  }, []);

  async function loadItems() {
    setLoading(true);
    const data = await getAllItems();
    setItems(data);
    setLoading(false);
  }

  async function loadDropdowns() {
    const [c, l, u] = await Promise.all([
      db.categories.toArray(),
      db.locations.toArray(),
      db.units.toArray(),
    ]);

    setCategories(c);
    setLocations(l);
    setUnits(u);
  }

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const allNames = filteredItems.map((item) => item.name);

  const isAllSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedItems.includes(item.name));

  const handleSaveItem = async (updatedItem: InventoryItem) => {
    if (selectedItem?.id !== undefined) {
      await updateItem(selectedItem.id, updatedItem);
      await loadItems();
    }
    setSelectedItem(null);
  };

  const handleDelete = async () => {
    if (selectedItems.length === 0) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`);
    if (!confirmDelete) return;

    for (const name of selectedItems) {
      const item = items.find((i) => i.name === name);
      if (item && item.id !== undefined) {
        if (item.imageId) {
          await db.images.delete(item.imageId);
        }
        await deleteItem(item.id);
      }
    }

    await loadItems();
    setSelectedItems([]);
    setSelectMode(false);
  };

  const handleAddItem = async (newItem: Omit<InventoryItem, "id">) => {
    const savedItem = await addItem(newItem);
    setItems((prev) => [...prev, savedItem]);
    setAddModalOpen(false);
  };

  // Add the draft items to shopping list
  const handleConfirmCart = async () => {
    for (const cartItem of cartItemsDraft) {
      const original = items.find((i) => i.name === cartItem.name);
      await db.shoppingList.add({
        name: cartItem.name,
        qty: cartItem.qty,
        unit: cartItem.unit || original?.unit || "pcs",
        brand: original?.brand || "",
        createdAt: new Date().toISOString(),
      });
    }
    alert("Added selected items to Shopping List!");
    setCartModalOpen(false);
    setSelectedItems([]);
    setSelectMode(false);
  };

  return (
    <div className="h-full flex flex-col gap-4 text-slate-200 overflow-hidden">
      <PageHeader
        title="Inventory"
        right={
          <div className="flex flex-wrap items-center gap-2">
            {/* ADD TO SHOPPING CART BUTTON */}
            {selectMode && (
              <button
                onClick={() => {
                  if (selectedItems.length === 0) return;
                  const draft = selectedItems.map((name) => {
                    const original = items.find((i) => i.name === name);
                    return {
                      name,
                      qty: 1,
                      unit: original?.unit || "pcs",
                    };
                  });
                  setCartItemsDraft(draft);
                  setCartModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-black transition font-bold shadow-lg shadow-emerald-500/15 cursor-pointer"
              >
                <ShoppingCart size={16} />
                <span>Add ({selectedItems.length})</span>
              </button>
            )}

            {/* SELECT ALL */}
            {selectMode && (
              <button
                onClick={() => {
                  if (isAllSelected) {
                    setSelectedItems([]);
                  } else {
                    setSelectedItems(allNames);
                  }
                }}
                className="px-3 py-2 rounded-2xl text-xs sm:text-sm bg-bg-item hover:bg-bg-card border border-border-custom text-text-title transition font-medium cursor-pointer"
              >
                {isAllSelected ? "Deselect All" : "Select All"}
              </button>
            )}

            {/* DELETE BUTTON */}
            {selectMode && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 px-3 py-2 rounded-2xl text-xs sm:text-sm bg-rose-500 hover:bg-rose-600 text-white transition font-bold cursor-pointer"
              >
                <Trash2 size={16} />
                <span>Delete ({selectedItems.length})</span>
              </button>
            )}

            {/* SELECT/CANCEL BUTTON */}
            <button
              onClick={() => {
                setSelectMode((prev) => !prev);
                setSelectedItems([]);
              }}
              className="px-3 py-2 rounded-2xl text-xs sm:text-sm bg-bg-item hover:bg-bg-card border border-border-custom text-text-title transition font-medium cursor-pointer"
            >
              {selectMode ? "Cancel" : "Select"}
            </button>

            {/* ADD ITEM */}
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-3 py-2 rounded-2xl text-xs sm:text-sm bg-accent-custom hover:bg-accent-custom-hover text-white transition font-bold shadow-lg shadow-accent-custom/15 cursor-pointer"
            >
              Add Item
            </button>

            {/* SEARCH */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search item..."
              className="border border-border-custom text-text-title bg-bg-item px-4 py-1.5 text-sm rounded-2xl w-40 sm:w-56 focus:outline-none placeholder:text-text-muted focus:border-accent-custom"
            />
          </div>
        }
      />

      {/* ITEM GRID */}
      <div className="flex-1 overflow-auto bg-bg-card rounded-3xl p-6 shadow-xl border border-border-custom">
        {loading ? (
          <div className="text-text-muted text-center py-12 font-medium">
            Loading inventory...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-text-muted text-center py-12 font-medium">
            No items found. Click "Add Item" to start!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {filteredItems.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                selectMode={selectMode}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSave={handleSaveItem}
          categories={categories}
          locations={locations}
          units={units}
        />
      )}

      {/* ADD ITEM MODAL */}
      {addModalOpen && (
        <AddItemModal
          onClose={() => setAddModalOpen(false)}
          onSave={handleAddItem}
        />
      )}

      {/* CART QUANTITY MODAL */}
      {cartModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-bg-card w-full max-w-md rounded-3xl p-6 shadow-2xl border border-border-custom text-text-main">
            <h2 className="text-xl font-semibold mb-4 text-text-title flex items-center gap-2">
              🛒 Choose Shopping List Quantities
            </h2>
            <div className="space-y-4 max-h-[50vh] overflow-auto pr-1">
              {cartItemsDraft.map((draft, idx) => (
                <div key={draft.name} className="flex items-center justify-between gap-4 bg-bg-item p-3 rounded-2xl border border-border-custom">
                  <span className="font-semibold text-text-title truncate">{draft.name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={draft.qty}
                      onChange={(e) => {
                        const next = [...cartItemsDraft];
                        next[idx].qty = Math.max(1, Number(e.target.value));
                        setCartItemsDraft(next);
                      }}
                      className="w-16 border border-border-custom bg-bg-card text-text-title px-2 py-1 rounded-xl text-center focus:outline-none focus:border-accent-custom"
                    />
                    <span className="text-sm text-text-muted">{draft.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleConfirmCart}
                className="flex-1 bg-accent-custom hover:bg-accent-custom-hover text-white py-2.5 rounded-2xl font-bold transition cursor-pointer shadow-lg shadow-accent-custom/15"
              >
                Add to Shopping List
              </button>
              <button
                onClick={() => setCartModalOpen(false)}
                className="flex-1 bg-bg-item hover:bg-bg-card border border-border-custom text-text-title py-2.5 rounded-2xl font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// INVENTORY CARD
interface InventoryCardProps {
  key?: any;
  item: InventoryItem;
  onClick: () => void;
  selectMode: boolean;
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
}

function InventoryCard({
  item,
  onClick,
  selectMode,
  selectedItems,
  setSelectedItems,
}: InventoryCardProps) {
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

  const isChecked = selectedItems.includes(item.name);

  function toggle(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (isChecked) {
      setSelectedItems(selectedItems.filter((i) => i !== item.name));
    } else {
      setSelectedItems([...selectedItems, item.name]);
    }
  }

  return (
    <div
      className={`relative bg-bg-item border rounded-3xl p-3 hover:shadow-md transition-all duration-300 flex flex-col h-64 justify-between cursor-pointer select-none hover:scale-[1.02]
        ${isChecked ? "border-accent-custom ring-2 ring-accent-custom/20 bg-bg-card" : "border-border-custom"}
      `}
      onClick={() => (selectMode ? toggle() : onClick())}
    >
      {/* CHECKBOX */}
      {selectMode && (
        <div 
          onClick={toggle}
          className="absolute top-3 right-3 w-6 h-6 rounded-full border border-border-custom bg-bg-card flex items-center justify-center cursor-pointer hover:bg-bg-item shadow-sm z-10"
        >
          {isChecked && <div className="w-3.5 h-3.5 rounded-full bg-accent-custom shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
        </div>
      )}

      <div className="h-32 bg-bg-card rounded-2xl mb-2 overflow-hidden flex items-center justify-center border border-border-custom">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-text-muted text-3xl">🍏</span>
        )}
      </div>

      <div className="text-center font-semibold text-text-title truncate px-1">
        {item.name}
      </div>
      <div className="text-center text-xs text-text-muted font-medium">
        Qty: {item.qty} {item.unit}
      </div>
    </div>
  );
}

// CARD DETAIL
interface DetailModalProps {
  item: InventoryItem;
  onClose: () => void;
  onSave: (updatedItem: InventoryItem) => void;
  categories: Category[];
  locations: Location[];
  units: Unit[];
}

function DetailModal({
  item,
  onClose,
  onSave,
  categories,
  locations,
  units,
}: DetailModalProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    ...item,
    imagePreview: null as string | null,
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    async function load() {
      const url = await getImage(form.imageId);
      setImgUrl(url);
    }
    load();
  }, [form.imageId]);

  const handleSave = async () => {
    let imageId = form.imageId;

    if (imageFile) {
      const oldImageId = form.imageId;
      imageId = await saveImage(imageFile);
      if (oldImageId) {
        await db.images.delete(oldImageId);
      }
    }

    onSave({
      ...form,
      imageId,
    });
    setEditMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-bg-card w-full max-w-xl max-h-[90vh] overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent p-6 rounded-3xl shadow-2xl border border-border-custom text-text-main">
        <div className="flex flex-col md:flex-row gap-6">
          {/* LEFT CONTENT */}
          <div className="flex-1 flex flex-col gap-3">
            <h2 className="text-xl font-bold text-text-title">
              {editMode ? (
                <input
                  value={form.name}
                  placeholder="Item Name"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-border-custom bg-bg-item p-3 rounded-2xl text-text-title focus:outline-none focus:border-accent-custom"
                />
              ) : (
                item.name
              )}
            </h2>

            <div>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-1">Description</span>
              {editMode ? (
                <textarea
                  value={form.desc || ""}
                  placeholder="Description"
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  className="w-full border border-border-custom bg-bg-item p-3 rounded-2xl text-text-title focus:outline-none focus:border-accent-custom resize-none"
                  rows={2}
                />
              ) : (
                <p className="text-sm text-text-main italic bg-bg-item p-3 rounded-2xl border border-border-custom">
                  {item.desc || "No description provided."}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              <div>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Brand</span>
                {editMode ? (
                  <input
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="h-10 w-full border border-border-custom bg-bg-item px-3 rounded-2xl text-text-title focus:outline-none focus:border-accent-custom mt-1"
                  />
                ) : (
                  <div className="font-semibold text-sm text-text-title bg-bg-item p-2 rounded-xl mt-1">{item.brand || "-"}</div>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Category</span>
                {editMode ? (
                  <div className="mt-1">
                    <CustomDropdown
                      options={categories.map((c) => c.name)}
                      value={form.category}
                      onChange={(value) => setForm({ ...form, category: value })}
                    />
                  </div>
                ) : (
                  <div className="font-semibold text-sm text-text-title bg-bg-item p-2 rounded-xl mt-1">{item.category}</div>
                )}
              </div>
            </div>

            <div className="mt-1">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Location</span>
              {editMode ? (
                <div className="mt-1">
                  <CustomDropdown
                    options={locations.map((l) => l.name)}
                    value={form.location}
                    onChange={(value) => setForm({ ...form, location: value })}
                  />
                </div>
              ) : (
                <div className="font-semibold text-sm text-text-title bg-bg-item p-2 rounded-xl mt-1">{item.location}</div>
              )}
            </div>
          </div>

          {/* RIGHT PIC */}
          <div className="w-full md:w-40 shrink-0 flex flex-col items-center">
            <input
              type="file"
              accept="image/*"
              id="item-image-detail"
              className="hidden"
              disabled={!editMode}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                setImageFile(file);

                const reader = new FileReader();
                reader.onload = () => {
                  setForm((prev) => ({
                    ...prev,
                    imagePreview: reader.result as string,
                  }));
                };
                reader.readAsDataURL(file);
              }}
            />

            <label
              htmlFor={editMode ? "item-image-detail" : undefined}
              className={editMode ? "cursor-pointer block" : "block"}
            >
              <div className="w-40 h-40 rounded-3xl border border-border-custom bg-bg-item overflow-hidden flex items-center justify-center hover:opacity-85 transition shadow-inner">
                {form.imagePreview ? (
                  <img
                    src={form.imagePreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-text-muted text-xs font-semibold text-center p-3">
                    {editMode ? "Click to upload" : "No Image"}
                  </span>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* PRICE & QUANTITY SECTION */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border-custom">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Quantity</span>
            {editMode ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  value={form.qty}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      qty: Number(e.target.value),
                    })
                  }
                  className="h-10 w-2/3 border border-border-custom bg-bg-item px-3 rounded-2xl text-text-title focus:outline-none focus:border-accent-custom"
                />
                <div className="w-1/3">
                  <CustomDropdown
                    options={units.map((u) => u.name)}
                    value={form.unit}
                    onChange={(value) => setForm({ ...form, unit: value })}
                  />
                </div>
              </div>
            ) : (
              <div className="font-bold text-text-title mt-1 bg-bg-item p-2.5 rounded-xl text-sm border border-border-custom">
                {item.qty} {item.unit}
              </div>
            )}
          </div>

          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Price</span>
            {editMode ? (
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                className="h-10 w-full border border-border-custom bg-bg-item px-3 rounded-2xl text-text-title focus:outline-none focus:border-accent-custom mt-1"
              />
            ) : (
              <div className="font-bold text-text-title mt-1 bg-bg-item p-2.5 rounded-xl text-sm border border-border-custom">
                RM {Number(item.price).toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* DATES */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border-custom">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Purchase Date</span>
            {editMode ? (
              <div className="mt-1">
                <DatePicker
                  selected={form.purchaseDate ? new Date(form.purchaseDate) : null}
                  onChange={(date) =>
                    setForm({
                      ...form,
                      purchaseDate: date ? date.toISOString().split("T")[0] : "",
                    })
                  }
                  dateFormat="yyyy-MM-dd"
                  className="h-10 w-full border border-border-custom px-3 rounded-2xl bg-bg-item text-text-title focus:outline-none focus:border-accent-custom"
                />
              </div>
            ) : (
              <div className="text-sm text-text-main mt-1 font-medium">{item.purchaseDate}</div>
            )}
          </div>

          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Expiry Date</span>
            {editMode ? (
              <div className="mt-1">
                <DatePicker
                  selected={form.expiryDate ? new Date(form.expiryDate) : null}
                  onChange={(date) =>
                    setForm({
                      ...form,
                      expiryDate: date ? date.toISOString().split("T")[0] : "",
                    })
                  }
                  dateFormat="yyyy-MM-dd"
                  className="h-10 w-full border border-border-custom px-3 rounded-2xl bg-bg-item text-text-title focus:outline-none focus:border-accent-custom"
                />
              </div>
            ) : (
              <div className="text-sm text-rose-500 mt-1 font-bold">{item.expiryDate || "No Expiry"}</div>
            )}
          </div>
        </div>

        {/* BUTTON ACTION PANELS */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-border-custom">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="flex-1 bg-accent-custom hover:bg-accent-custom-hover text-white py-2.5 rounded-2xl font-bold transition cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-accent-custom/15"
              >
                <Check size={18} /> Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="flex-1 bg-bg-item hover:bg-bg-card border border-border-custom text-text-title py-2.5 rounded-2xl font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="flex-1 bg-accent-custom hover:bg-accent-custom-hover text-white py-2.5 rounded-2xl font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-accent-custom/15"
              >
                <Edit2 size={16} /> Edit
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-bg-item hover:bg-bg-card border border-border-custom text-text-title py-2.5 rounded-2xl font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ADD ITEM MODAL
interface AddItemModalProps {
  onClose: () => void;
  onSave: (newItem: Omit<InventoryItem, "id">) => Promise<void>;
}

function AddItemModal({ onClose, onSave }: AddItemModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [form, setForm] = useState({
    name: "",
    qty: "",
    unit: "",
    desc: "",
    category: "",
    brand: "",
    location: "",
    price: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    imagePreview: null as string | null,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDropdowns();
  }, []);

  async function loadDropdowns() {
    const [c, l, u] = await Promise.all([
      db.categories.toArray(),
      db.locations.toArray(),
      db.units.toArray(),
    ]);
    setCategories(c);
    setLocations(l);
    setUnits(u);
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.category || !form.location || !form.qty || !form.unit) {
      alert("Please fill in Name, Category, Location, Quantity, and Unit.");
      return;
    }

    setSaving(true);
    try {
      let imageId = null;
      if (imageFile) {
        imageId = await saveImage(imageFile);
      }

      await onSave({
        imageId,
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category,
        location: form.location,
        qty: Number(form.qty),
        unit: form.unit,
        price: Number(form.price) || 0,
        purchaseDate: form.purchaseDate,
        expiryDate: form.expiryDate,
        desc: form.desc.trim(),
      });
    } catch (e) {
      console.error(e);
      alert("Error adding item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-bg-card w-full max-w-xl max-h-[90vh] overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent p-6 rounded-3xl shadow-2xl border border-border-custom text-text-main">
        <h2 className="text-xl font-bold mb-4 text-text-title flex items-center gap-1.5">
          <Plus size={20} /> Add Item
        </h2>

        <div className="flex flex-col gap-4">
          <input
            placeholder="Item Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-border-custom bg-bg-item p-3 rounded-2xl text-text-title focus:outline-none focus:border-accent-custom text-sm placeholder:text-text-muted"
          />

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-3">
              <textarea
                placeholder="Description"
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                className="w-full border border-border-custom bg-bg-item p-3 rounded-2xl text-text-title focus:outline-none focus:border-accent-custom resize-none text-sm placeholder:text-text-muted"
                rows={2}
              />

              <input
                placeholder="Brand"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="h-10 w-full border border-border-custom bg-bg-item px-3 rounded-2xl text-text-title focus:outline-none focus:border-accent-custom text-sm placeholder:text-text-muted"
              />
            </div>

            <div className="w-40 shrink-0 self-center md:self-stretch flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                id="add-item-image"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setImageFile(file);

                  const reader = new FileReader();
                  reader.onload = () => {
                    setForm((prev) => ({
                      ...prev,
                      imagePreview: reader.result as string,
                    }));
                  };
                  reader.readAsDataURL(file);
                }}
              />

              <label htmlFor="add-item-image" className="cursor-pointer block">
                <div className="w-40 h-32 rounded-3xl border border-border-custom bg-bg-item overflow-hidden flex flex-col items-center justify-center hover:opacity-85 transition shadow-inner">
                  {form.imagePreview ? (
                    <img
                      src={form.imagePreview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <span className="text-xl block mb-0.5">📸</span>
                      <span className="text-text-muted text-[10px] font-semibold">Click to upload</span>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CustomDropdown
              options={categories.map((c) => c.name)}
              placeholder="Category *"
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
            />

            <CustomDropdown
              options={locations.map((l) => l.name)}
              placeholder="Location *"
              value={form.location}
              onChange={(value) => setForm({ ...form, location: value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Qty *"
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
                className="h-10 w-2/3 border border-border-custom bg-bg-item px-3 rounded-2xl text-text-title focus:outline-none focus:border-accent-custom text-sm placeholder:text-text-muted"
              />

              <div className="w-1/3">
                <CustomDropdown
                  options={units.map((u) => u.name)}
                  placeholder="Unit *"
                  value={form.unit}
                  onChange={(value) => setForm({ ...form, unit: value })}
                />
              </div>
            </div>

            <input
              type="number"
              step="0.01"
              placeholder="Price (RM)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="h-10 w-full border border-border-custom bg-bg-item px-3 rounded-2xl text-text-title focus:outline-none focus:border-accent-custom text-sm placeholder:text-text-muted"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider pl-1">Purchase Date</span>
              <DatePicker
                selected={form.purchaseDate ? new Date(form.purchaseDate) : null}
                onChange={(date) =>
                  setForm((prev) => ({
                    ...prev,
                    purchaseDate: date ? date.toISOString().split("T")[0] : "",
                  }))
                }
                dateFormat="yyyy-MM-dd"
                placeholderText="Purchase Date"
                className="h-10 w-full border border-border-custom px-3 rounded-2xl bg-bg-item text-text-title focus:outline-none focus:border-accent-custom text-sm cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider pl-1">Expiry Date</span>
              <DatePicker
                selected={form.expiryDate ? new Date(form.expiryDate) : null}
                onChange={(date) =>
                  setForm((prev) => ({
                    ...prev,
                    expiryDate: date ? date.toISOString().split("T")[0] : "",
                  }))
                }
                dateFormat="yyyy-MM-dd"
                placeholderText="Expiry Date"
                className="h-10 w-full border border-border-custom px-3 rounded-2xl bg-bg-item text-text-title focus:outline-none focus:border-accent-custom text-sm cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-border-custom justify-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-accent-custom hover:bg-accent-custom-hover text-white py-2.5 rounded-2xl font-bold transition disabled:opacity-50 cursor-pointer shadow-lg shadow-accent-custom/15"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 bg-bg-item hover:bg-bg-card border border-border-custom text-text-title py-2.5 rounded-2xl font-semibold transition disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
