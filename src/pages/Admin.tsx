import Sidebar from "../components/Layout/Sidebar";
import { Outlet } from "react-router-dom";

const Admin = () => {
  return (
    <div className="w-full flex h-full">
      <Sidebar />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Admin;
