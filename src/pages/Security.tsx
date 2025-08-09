import React, { useState } from 'react'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'
import Select from '../components/UI/Select'
import CreateUserModal from '../components/Modals/CreateUserModal'
import CreateRoleModal from '../components/Modals/CreateRoleModal'
import './Security.css'

const Security: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Users')
  const [showUserModal, setShowUserModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const tabs = ['Users', 'Roles', 'Groups', 'Signatures', 'Online Users', 'Audit Logs']

  const handleUserSubmit = (data: any) => {
    console.log('User created:', data)
  }

  const handleRoleSubmit = (data: any) => {
    console.log('Role created:', data)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Users':
        return (
          <div className="tab-content">
            <div className="content-header">
              <div className="search-section">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <Select
                  options={[
                    { value: 'All', label: 'All' },
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' }
                  ]}
                  value="All"
                  className="filter-select"
                />
                <Button variant="secondary" size="sm">🔍</Button>
              </div>
              <Button onClick={() => setShowUserModal(true)}>
                + Create User...
              </Button>
            </div>
            
            <div className="data-table">
              <div className="table-header">
                <div className="header-cell">#</div>
                <div className="header-cell">USER ID</div>
                <div className="header-cell">FULL NAME</div>
                <div className="header-cell">PASSWORD EXP</div>
                <div className="header-cell">LAST LOGIN</div>
              </div>
              <div className="table-body">
                <div className="table-row">
                  <div className="table-cell">
                    <div className="placeholder-bar short"></div>
                  </div>
                  <div className="table-cell">
                    <div className="placeholder-bar medium"></div>
                  </div>
                  <div className="table-cell">
                    <div className="placeholder-bar long"></div>
                  </div>
                  <div className="table-cell">
                    <div className="placeholder-bar medium"></div>
                  </div>
                  <div className="table-cell">
                    <div className="placeholder-bar medium"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'Roles':
        return (
          <div className="tab-content">
            <div className="content-header">
              <div className="search-section">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <Button onClick={() => setShowRoleModal(true)}>
                + Create Role...
              </Button>
            </div>
            
            <div className="data-table">
              <div className="table-header">
                <div className="header-cell">#</div>
                <div className="header-cell">ROLE ID</div>
                <div className="header-cell">ROLE NAME</div>
                <div className="header-cell">MEMBERS</div>
              </div>
              <div className="table-body">
                <div className="no-data">No items found</div>
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="tab-content">
            <div className="content-header">
              <div className="search-section">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            <div className="no-data">No items found</div>
          </div>
        )
    }
  }

  return (
    <div className="security-page">
      <div className="page-header">
        <h1>Security</h1>
      </div>

      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {renderTabContent()}

      <CreateUserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSubmit={handleUserSubmit}
      />

      <CreateRoleModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSubmit={handleRoleSubmit}
      />
    </div>
  )
}

export default Security
