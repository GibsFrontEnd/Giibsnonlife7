import React from 'react'
import './Header.css'

const Header: React.FC = () => {
  const navItems = [
    'Home', 'CSU', 'Quotation', 'Underwriting', 'Claims', 
    'Reinsurance', 'Requisition', 'Accounting', 'Analytics', 'Admin'
  ]

  return (
    <header className="header">
      <div className="header-nav">
        {navItems.map((item, index) => (
          <button
            key={item}
            className={`nav-item ${index === navItems.length - 1 ? 'active' : ''}`}
          >
            {item}
          </button>
        ))}
      </div>
      
      {/* <div className="header-user">
        <div className="notification-icon">🔔</div>
        <div className="user-info">
          <span className="user-email">olayinka_k@inttecktechnologies.com</span>
          <span className="dropdown-arrow">▼</span>
        </div>
      </div> */}
    </header>
  )
}

export default Header
