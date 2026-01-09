import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useState } from "react";

const Layout = ({ children, showSidebar = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="flex">
        {showSidebar && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
