import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

const Sidebar: React.FC = () => {
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/security', label: 'Security', icon: '🔒' },
    { path: '/products', label: 'Products', icon: '📦' },
    { path: '/features', label: 'Features', icon: '⚡' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">GIBS ENTERPRISE 7</h2>
        <div className="admin-label">ADMIN</div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
