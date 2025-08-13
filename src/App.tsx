import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Security from './pages/Security'
import Products from './pages/Products'
import Company from './pages/Company'
import Features from './pages/Features'
import Settings from './pages/Settings'
import './styles/global.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/security" element={<Security />} />
            <Route path="/products" element={<Products />} />
            <Route path="/company" element={<Company />} />
            <Route path="/features" element={<Features />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  )
}

export default App
