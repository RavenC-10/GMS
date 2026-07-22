import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div className="w-screen h-screen bg-bg-main text-text-main overflow-hidden flex">
      {/* SIDEBAR */}
      <aside className="h-screen py-6 pl-6 shrink-0 flex flex-col">
        <Sidebar />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-screen p-6 overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
