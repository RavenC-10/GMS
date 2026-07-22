import { useState, useRef, useEffect } from "react";

interface CustomDropdownProps {
  options: string[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  compact?: boolean;
}

function CustomDropdown({
  options,
  placeholder,
  value,
  onChange,
  className = "",
  compact = false,
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // CLOSE WHEN CLICK OUTSIDE
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | PointerEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* BUTTON */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`${compact ? "h-9 rounded-xl text-xs pl-3 pr-3" : "h-10 rounded-2xl text-sm pl-3 pr-3"} w-full border border-border-custom bg-bg-item text-left text-text-main shadow-sm hover:border-border-custom/80 transition`}
      >
        <div className="flex items-center justify-between">
          <span className="truncate">
            {value || placeholder || "Select"}
          </span>
          <span className="text-[10px] text-text-muted">
            ▼
          </span>
        </div>
      </button>

      {/* MENU */}
      {open && (
        <div className={`absolute max-h-60 w-full mt-1 bg-bg-card border border-border-custom ${compact ? "rounded-xl text-xs" : "rounded-2xl text-sm"} shadow-xl overflow-auto z-50`}>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-text-main hover:bg-bg-item hover:text-text-title transition truncate"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomDropdown;
