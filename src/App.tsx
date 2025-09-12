import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import "./styles/global.css";
import { useAuth } from "./hooks/use-auth";
import { useSelector } from "react-redux";
import { RootState } from "./features/store";
import { Toaster } from "./components/UI/toaster";
import HomePage from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/admin/admin-page.Dashboard";
import AdminSecurity from "./pages/admin/admin-page.Security";
import AdminProducts from "./pages/admin/admin-page.Products";
import AdminFeatures from "./pages/admin/admin-page.Features";
import AdminSettings from "./pages/admin/admin-page.Settings";
import Dashboard from "./pages/Dashboard";
import CSU from "./pages/CSU";
import CSUEnquiries from "./pages/csu/csu-page.enquiries";
import CSUCustomers from "./pages/csu/csu-page.customers";
import CSUPartners from "./pages/csu/csu-page.partners";
import CSUMessaging from "./pages/csu/csu-page.messaging";
import CSUTickets from "./pages/csu/csu-page.tickets";
import AdminCompany from "./pages/admin/admin-page.Company";

const App: React.FC = () => {
  useAuth();
  const isExpired = useSelector((state: RootState) => state.auth.isExpired);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/csu" element={<CSU />}>
            <Route path="enquiries" element={<CSUEnquiries />} />
            <Route path="customers" element={<CSUCustomers />} />
            <Route path="partners" element={<CSUPartners />} />
            <Route path="messaging" element={<CSUMessaging />} />
            <Route path="tickets" element={<CSUTickets />} />
          </Route>

          <Route path="/admin" element={<Admin />}>
            <Route index element={<AdminDashboard />} />
            <Route path="security" element={<AdminSecurity />} />
            <Route path="company" element={<AdminCompany />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="features" element={<AdminFeatures />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to={!isExpired ? "/dashboard" : "/"} />}
        />
      </Routes>
    </>
  );
};

export default App;
