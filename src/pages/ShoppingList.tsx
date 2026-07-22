import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { Trash2, Download, Plus } from "lucide-react";
import { db } from "../db/db";
import { type ShoppingListItem } from "../types";

function ShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // holds item names or ids

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    const data = await db.shoppingList.toArray();
    setItems(data);
    setLoading(false);
  }

  const allNames = items.map((item) => item.name);

  const isAllSelected =
    items.length > 0 &&
    items.every((item) => selectedItems.includes(item.name));

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return;
    const confirmDelete = window.confirm(`Delete ${selectedItems.length} items from shopping list?`);
    if (!confirmDelete) return;

    for (const name of selectedItems) {
      const matched = items.filter((i) => i.name === name);
      for (const item of matched) {
        if (item.id !== undefined) {
          await db.shoppingList.delete(item.id);
        }
      }
    }

    await loadItems();
    setSelectedItems([]);
    setSelectMode(false);
  };

  const handleAddItemDirectly = async (name: string, brand: string, qty: number) => {
    await db.shoppingList.add({
      name,
      brand: brand || undefined,
      qty,
      createdAt: new Date().toISOString(),
    });
    await loadItems();
  };

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allNames);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 text-text-main overflow-hidden">
      {/* HEADER */}
      <PageHeader
        title="Shopping List"
        right={
          <div className="flex flex-wrap items-center gap-2">
            {/* SELECT ALL */}
            {selectMode && (
              <button
                onClick={handleToggleSelectAll}
                className="px-3 py-2 rounded-2xl text-xs sm:text-sm bg-bg-item hover:bg-bg-card border border-border-custom text-text-title transition font-medium cursor-pointer"
              >
                {isAllSelected ? "Deselect All" : "Select All"}
              </button>
            )}

            {/* DELETE */}
            {selectMode && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1 px-3 py-2 rounded-2xl text-xs sm:text-sm bg-rose-500 hover:bg-rose-600 text-white transition font-bold cursor-pointer"
              >
                <Trash2 size={16} />
                <span>Delete ({selectedItems.length})</span>
              </button>
            )}

            {/* SELECT/CANCEL */}
            <button
              onClick={() => {
                setSelectMode((prev) => !prev);
                setSelectedItems([]);
              }}
              className="px-3 py-2 rounded-2xl text-xs sm:text-sm bg-bg-item hover:bg-bg-card border border-border-custom text-text-title transition font-medium cursor-pointer"
            >
              {selectMode ? "Cancel" : "Select"}
            </button>

            {/* EXPORT */}
            <button
              onClick={() => exportList(items)}
              disabled={items.length === 0}
              className="flex items-center gap-1 bg-accent-custom hover:bg-accent-custom-hover text-white px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold transition disabled:opacity-40 cursor-pointer shadow-lg shadow-accent-custom/15"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        }
      />

      {/* MAIN CONTAINER */}
      <div className="flex-1 bg-bg-card rounded-3xl shadow-xl border border-border-custom p-6 flex flex-col overflow-hidden">
        {/* ADD ITEM INPUT GROUP */}
        <AddItem onAdd={handleAddItemDirectly} />

        {/* LIST */}
        <div className="mt-6 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {loading ? (
            <p className="text-center text-text-muted py-8">Loading shopping list...</p>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-text-muted font-medium bg-bg-item border border-dashed border-border-custom rounded-2xl">
              🍎 Your shopping list is empty! Add items above or from the Inventory page.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
              {items.map((item, index) => (
                <ItemRow
                  key={item.id ?? index}
                  item={item}
                  index={index}
                  selectMode={selectMode}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                  onDeleteSingle={async () => {
                    if (item.id !== undefined) {
                      await db.shoppingList.delete(item.id);
                      await loadItems();
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
   ADD ITEM COMPONENT
 ========== */
interface AddItemProps {
  onAdd: (name: string, brand: string, qty: number) => Promise<void>;
}

function AddItem({ onAdd }: AddItemProps) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [qty, setQty] = useState("");

  async function handleAdd() {
    if (!name.trim()) return;
    const quantity = Number(qty) || 1;

    await onAdd(name.trim(), brand.trim(), quantity);

    setName("");
    setBrand("");
    setQty("");
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Item name *"
        className="flex-1 border border-border-custom bg-bg-item p-3 rounded-2xl focus:outline-none focus:border-accent-custom placeholder:text-text-muted text-sm text-text-title"
      />

      <input
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        placeholder="Brand (optional)"
        className="flex-1 border border-border-custom bg-bg-item p-3 rounded-2xl focus:outline-none focus:border-accent-custom placeholder:text-text-muted text-sm text-text-title"
      />

      <input
        type="number"
        min="1"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        placeholder="Qty (defaults to 1)"
        className="w-full sm:w-28 border border-border-custom bg-bg-item p-3 rounded-2xl focus:outline-none focus:border-accent-custom placeholder:text-text-muted text-sm text-text-title"
      />

      <button
        onClick={handleAdd}
        disabled={!name.trim()}
        className="bg-accent-custom hover:bg-accent-custom-hover disabled:bg-bg-item disabled:text-text-muted disabled:cursor-not-allowed disabled:shadow-none text-white px-5 py-3 rounded-2xl font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-accent-custom/15"
      >
        <Plus size={18} />
        <span>Add</span>
      </button>
    </div>
  );
}

/* ITEM ROW COMPONENT */
interface ItemRowProps {
  key?: any;
  item: ShoppingListItem;
  index: number;
  selectMode: boolean;
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  onDeleteSingle: () => void;
}

function ItemRow({
  item,
  index,
  selectMode,
  selectedItems,
  setSelectedItems,
  onDeleteSingle,
}: ItemRowProps) {
  const isChecked = selectedItems.includes(item.name);

  function toggleSelect() {
    if (isChecked) {
      setSelectedItems(selectedItems.filter((i) => i !== item.name));
    } else {
      setSelectedItems([...selectedItems, item.name]);
    }
  }

  return (
    <div
      onClick={() => {
        if (selectMode) toggleSelect();
      }}
      className={`flex items-center justify-between bg-bg-item border rounded-2xl p-4 shadow-sm hover:shadow-md transition duration-200 cursor-pointer select-none
        ${isChecked ? "border-accent-custom bg-bg-card" : "border-border-custom"}
      `}
    >
      <div className="flex items-center min-w-0 flex-1">
        {/* LEFT FIXED SLOT */}
        <div className="w-8 flex justify-center mr-3 text-text-title font-bold">
          {selectMode ? (
            <input
              type="checkbox"
              checked={isChecked}
              onChange={toggleSelect}
              className="w-5 h-5 pointer-events-none rounded border-border-custom text-accent-custom focus:ring-accent-custom accent-accent-custom"
            />
          ) : (
            <span className="text-xs bg-bg-card text-text-muted px-2 py-0.5 rounded-md border border-border-custom">{index + 1}</span>
          )}
        </div>

        {/* ITEM NAME */}
        <span className="font-semibold text-text-title truncate pr-2">
          {item.name}
          {item.brand ? <span className="font-medium text-text-muted text-sm ml-1">({item.brand})</span> : ""}
        </span>
      </div>

      <div className="flex items-center gap-4 shrink-0 pl-2">
        <span className="text-sm font-semibold text-text-main bg-bg-card px-3 py-1 rounded-xl border border-border-custom">
          Qty: {item.qty} {item.unit || "pcs"}
        </span>

        {!selectMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSingle();
            }}
            className="p-1.5 rounded-lg text-text-muted hover:bg-bg-card hover:text-rose-500 transition cursor-pointer"
            title="Remove item"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

/* EXPORT FUNCTION */
function exportList(items: ShoppingListItem[]) {
  const text = items
    .map((i, index) => {
      const brandPart = i.brand ? ` (${i.brand})` : "";
      const unitPart = i.unit ? ` ${i.unit}` : " pcs";
      return `${index + 1}. ${i.name}${brandPart} - ${i.qty}${unitPart}`;
    })
    .join("\n");

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "grocery-shopping-list.txt";
  a.click();

  URL.revokeObjectURL(url);
}

export default ShoppingList;
