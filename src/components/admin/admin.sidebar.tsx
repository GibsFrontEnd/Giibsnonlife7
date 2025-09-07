import { Link, useLocation } from "react-router-dom";

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "", label: "Dashboard", icon: "📊" },
    { path: "security", label: "Security", icon: "🔒" },
    { path: "products", label: "Products", icon: "📦" },
    { path: "features", label: "Features", icon: "⚡" },
    { path: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="w-52 bg-primary text-white flex flex-col h-full relative md:w-52 max-md:w-15">
      <nav className="flex-1 py-2.5">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center py-3 px-5 text-white/80 no-underline transition-all duration-200 border-l-3 border-transparent hover:bg-white/10 hover:text-white max-md:justify-center max-md:py-4 max-md:px-2.5 ${
              location.pathname === item.path 
                ? "bg-white/15 text-white border-l-orange-500" 
                : ""
            }`}
          >
            <span className="mr-3 text-base max-md:mr-0">{item.icon}</span>
            <span className="text-sm font-medium max-md:hidden">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;