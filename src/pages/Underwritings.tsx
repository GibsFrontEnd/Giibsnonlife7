import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import UnderwritingSidebar from "../components/underwritings/underwritings.sidebar";

const Underwritings = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/underwritings") {
      navigate("underwriting");
    }
  }, [navigate]);

  return (
    <div className="w-full flex h-full">
      <UnderwritingSidebar />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:ml-52 max-md:ml-15">
        <Outlet />
      </div>
    </div>
  );
};

export default Underwritings;
