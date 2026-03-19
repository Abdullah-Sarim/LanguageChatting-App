import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useState } from "react";

const Layout = ({ children, hideSidebar = false, fullPage = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="min-h-screen flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        hideByDefault={hideSidebar}
      />
      <div className="flex-1 flex flex-col w-0">
        <Navbar onMenuClick={toggleSidebar} hideSidebar={hideSidebar} />
        <main className={`flex-1 ${fullPage ? "overflow-hidden" : "overflow-y-auto"}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
