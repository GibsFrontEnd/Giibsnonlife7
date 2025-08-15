import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Security from "./pages/Security";
import Products from "./pages/Products";
import Company from "./pages/Company";
import Features from "./pages/Features";
import Settings from "./pages/Settings";
import "./styles/global.css";
import { useAuth } from "./hooks/use-auth";
import { useSelector } from "react-redux";
import { RootState } from "./features/store";
import { Toaster } from "./components/ui/toaster";
import HomePage from "./pages/Home";
import LoginPage from "./pages/LoginPage";

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
          <Route path="/security" element={<Security />} />
          <Route path="/products" element={<Products />} />
          <Route path="/company" element={<Company />} />
          <Route path="/features" element={<Features />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* <div className="app">
          <Layout>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/security" element={<Security />} />
            <Route path="/products" element={<Products />} />
            <Route path="/company" element={<Company />} />
            <Route path="/features" element={<Features />} />
            <Route path="/settings" element={<Settings />} />
          </Layout>
        </div> */}
      </Routes>
    </>
  );
};

export default App;
