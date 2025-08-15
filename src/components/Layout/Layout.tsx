import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Layout.css";
import { Outlet } from "react-router-dom";

// interface LayoutProps {
//   children: React.ReactNode;
// }

const Layout: React.FC = () => {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
