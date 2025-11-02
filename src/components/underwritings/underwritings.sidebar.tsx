import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllRisks } from "../../features/reducers/adminReducers/riskSlice";
import type { AppDispatch, RootState } from "../../features/store";

const UnderwritingSidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { risks} = useSelector((s: RootState) => s.risks);
  const [underwritingsOpen, setUnderwritingsOpen] = useState(true);

  // load risks
  useEffect(() => {
    dispatch(getAllRisks({ pageNumber: 1, pageSize: 100 }) as any);
  }, [dispatch]);

  // Build Underwriting items (All + each risk)
  const UnderwritingItems = [
    { path: "underwriting", label: "All", icon: "📋", id: "all" },
    ...(risks || []).map((risk) => ({
      path: `underwriting/${risk.riskID}`,
      label: risk.riskName,
      icon: "🔸",
      id: risk.riskID,
    })),
  ];

  // other static menu items

  // helper to detect active link (handles nested routes)
  const isActive = (itemPath: string) =>
    location.pathname === itemPath || location.pathname.startsWith(itemPath + "/");

  return (
    <aside
      className="
      fixed left-0 top-0 bottom-0 z-100
      bg-primary text-white
      flex flex-col
      overflow-y-auto
      md:w-52 max-md:w-15
    "
      aria-label="Main sidebar"
    >
      <div className="font-bold text-lg pt-5 pl-3 pb-4">GIBS ENTERPRISE 7</div>

      <nav className="flex-1 py-2.5">
        {/* Underwritings section (collapsible) */}
        <div>
          <button
            onClick={() => setUnderwritingsOpen((v) => !v)}
            className={`w-full flex items-center justify-between py-3 px-5 text-white/90 no-underline transition-all duration-200 border-l-4 border-transparent hover:bg-white/10 hover:text-white max-md:justify-center max-md:py-4 max-md:px-2.5 ${
              location.pathname.startsWith("/underwriting") ? "bg-white/15 text-white border-l-orange-500" : ""
            }`}
            aria-expanded={underwritingsOpen}
            aria-controls="quotes-submenu"
          >
            <div className="flex items-center">
              <span className="mr-3 text-base max-md:mr-0">🔒</span>
              <span className="text-sm font-medium max-md:hidden">Underwritings</span>
            </div>
            <span className="text-sm max-md:hidden">{underwritingsOpen ? "▾" : "▸"}</span>
          </button>

          <div
            id="quotes-submenu"
            className={`pl-6 transition-all max-md:hidden ${underwritingsOpen ? "block" : "hidden"}`}
          >
            {!risks && (
              <div className="py-2 px-2 text-xs text-white/70">Loading risks…</div>
            )}

            {risks && UnderwritingItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center py-2 px-3 text-white/80 no-underline transition-all duration-150 rounded-md hover:bg-white/6 hover:text-white ${
                  isActive(item.path) ? "bg-white/12 text-white font-semibold" : ""
                }`}
              >
                <span className="mr-3 text-sm">{item.icon}</span>
                <span className="text-sm max-md:hidden">{item.label}</span>
              </Link>
            ))}

            {risks && UnderwritingItems.length === 1 && (
              <div className="py-2 px-3 text-xs text-white/70">No risk categories found.</div>
            )}
          </div>
        </div>

      </nav>
    </aside>
  );
};

export default UnderwritingSidebar;
