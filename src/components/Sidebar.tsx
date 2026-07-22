import { useNavigate, useLocation } from "react-router-dom";
import { House, ShoppingCart, Package, Settings } from "lucide-react";
import { type ReactNode } from "react";

interface MenuItem {
  name: string;
  path: string;
  icon: ReactNode;
}

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menus: MenuItem[] = [
    { name: "Home", path: "/", icon: <House size={26} /> },
    { name: "Inventory", path: "/inventory", icon: <Package size={26} /> },
    { name: "Shopping List", path: "/shopping-list", icon: <ShoppingCart size={26} /> },
    { name: "Setting", path: "/settings", icon: <Settings size={26} /> },
  ];

  const mainMenus = menus.filter((m) => m.name !== "Setting");
  const bottomMenu = menus.find((m) => m.name === "Setting");

  return (
    <div className="flex flex-col h-full bg-bg-sidebar border border-border-custom rounded-[28px] shadow-2xl items-center py-8 gap-8 overflow-hidden w-28 shrink-0">
      {/* TOP LOGO */}
      <div className="w-14 h-14 rounded-2xl bg-accent-custom/10 border border-accent-custom/20 text-accent-custom flex items-center justify-center font-extrabold text-2xl select-none shadow-sm">
        🍏
      </div>

      <div className="flex flex-col flex-1 items-center w-full justify-between">
        {/* MAIN MENUS */}
        <div className="flex flex-col gap-6 items-center w-full">
          {mainMenus.map((menu) => {
            const isActive = location.pathname === menu.path;

            return (
              <button
                key={menu.name}
                onClick={() => navigate(menu.path)}
                className={`p-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center cursor-pointer relative group
                  ${
                    isActive
                      ? "bg-accent-custom/15 text-accent-custom border-l-2 border-accent-custom scale-105"
                      : "text-text-muted hover:text-text-title hover:bg-bg-item"
                  }
                `}
                title={menu.name}
              >
                {menu.icon}
              </button>
            );
          })}
        </div>

        {/* BOTTOM MENU */}
        {bottomMenu && (
          <div className="pb-2">
            <button
              onClick={() => navigate(bottomMenu.path)}
              className={`p-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center cursor-pointer relative group
                ${
                  location.pathname === bottomMenu.path
                    ? "bg-accent-custom/15 text-accent-custom border-l-2 border-accent-custom scale-105"
                    : "text-text-muted hover:text-text-title hover:bg-bg-item"
                }
              `}
              title={bottomMenu.name}
            >
              {bottomMenu.icon}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
