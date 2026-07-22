import { useState } from "react";
import { Trash2 } from "lucide-react";

interface TagItem {
  id?: number;
  name: string;
}

interface TagInputProps {
  label: string;
  table?: string;
  values: TagItem[];
  setValues: (values: TagItem[]) => void;
  onAdd?: (name: string) => Promise<void>;
  onUpdate?: (id: number, name: string) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
}

function TagInput({
  label,
  values,
  setValues,
  onAdd,
  onUpdate,
  onDelete,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // ADD or UPDATE
  const handleAddOrUpdate = async () => {
    if (!input.trim()) return;

    // UPDATE MODE
    if (isEditing && selectedIndex !== null) {
      const item = values[selectedIndex];
      if (item.id !== undefined) {
        await onUpdate?.(item.id, input.trim());

        setValues(
          values.map((v, i) =>
            i === selectedIndex ? { ...v, name: input.trim() } : v
          )
        );
      }

      setIsEditing(false);
      setSelectedIndex(null);
      setInput("");
      return;
    }

    // ADD MODE
    await onAdd?.(input.trim());

    // In a real database we reload, but to ensure instant UI responsiveness:
    setValues([
      ...values,
      { id: Date.now(), name: input.trim() }, // temporary UI update
    ]);
    setInput("");
  };

  // DELETE
  const deleteItem = async () => {
    if (selectedIndex === null) return;
    const item = values[selectedIndex];

    if (item.id !== undefined) {
      await onDelete?.(item.id);
    }

    setValues(values.filter((_, i) => i !== selectedIndex));
    setSelectedIndex(null);
  };

  // EDIT
  const editItem = () => {
    if (selectedIndex === null) return;

    setInput(values[selectedIndex].name);
    setIsEditing(true);
  };

  return (
    <div className="mb-4">
      {/* LABEL + CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        <span className="w-24 font-semibold text-text-title">{label}</span>

        <div className="flex flex-wrap gap-2 items-center flex-1">
          {/* INPUT */}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddOrUpdate()}
            placeholder={`Add ${label}`}
            className="border border-border-custom bg-bg-item text-text-title px-3 py-1 rounded-xl w-40 text-sm focus:outline-none focus:border-accent-custom placeholder:text-text-muted"
          />

          {/* ADD / UPDATE */}
          <button
            onClick={handleAddOrUpdate}
            className="bg-accent-custom hover:bg-accent-custom-hover text-white px-3 py-1 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            {isEditing ? "Update" : "Add"}
          </button>

          {/* EDIT */}
          <button
            onClick={editItem}
            disabled={selectedIndex === null}
            className="bg-bg-item hover:bg-bg-card border border-border-custom text-text-title px-3 py-1 rounded-xl text-sm font-semibold transition disabled:opacity-40 cursor-pointer"
          >
            Edit
          </button>

          {/* DELETE */}
          <button
            onClick={deleteItem}
            disabled={selectedIndex === null}
            className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-xl text-sm disabled:opacity-40 transition cursor-pointer flex items-center justify-center"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="flex flex-wrap gap-2 ml-0 sm:ml-24">
        {values.map((item, index) => (
          <div
            key={item.id ?? index}
            onClick={() => {
              if (selectedIndex === index) {
                setSelectedIndex(null);
                setIsEditing(false);
                setInput("");
              } else {
                setSelectedIndex(index);
              }
            }}
            className={`px-3 py-1 rounded-full border cursor-pointer text-sm flex items-center gap-2 select-none transition-all
              ${
                selectedIndex === index
                  ? "bg-accent-custom/20 border-accent-custom text-accent-custom font-semibold shadow-sm"
                  : "bg-bg-item border-border-custom text-text-main hover:bg-bg-card"
              }`}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TagInput;
