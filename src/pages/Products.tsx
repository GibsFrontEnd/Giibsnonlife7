import React, { useState } from 'react'
import Button from '../components/ui/button'
import Input from '../components/ui/input'
import Select from '../components/ui/select'
import CreateProductModal from '../components/modals/CreateProductModal'
import './Products.css'

const Products: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Products')
  const [showProductModal, setShowProductModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Active')

  const tabs = ['Risks', 'Products']
  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ]

  const handleProductSubmit = (data: any) => {
    console.log('Product created:', data)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Products':
        return (
          <div className="tab-content">
            <div className="content-header">
              <div className="search-controls">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="status-filter"
                />
                <Button variant="secondary" size="sm">🔍</Button>
              </div>
              <Button onClick={() => setShowProductModal(true)}>
                + Create Product...
              </Button>
            </div>
            
            <div className="products-table">
              <div className="table-header">
                <div className="header-cell">PRODUCT ID</div>
                <div className="header-cell">PRODUCT NAME</div>
                <div className="header-cell">RATES</div>
                <div className="header-cell">RISK</div>
                <div className="header-cell">MIDRISK</div>
              </div>
              <div className="table-body">
                <div className="no-data">No items found</div>
              </div>
            </div>
          </div>
        )
      
      case 'Risks':
        return (
          <div className="tab-content">
            <div className="risks-layout">
              <div className="risks-section">
                <h3>Classes</h3>
                <div className="risks-table">
                  <div className="table-header">
                    <div className="header-cell">RISK ID</div>
                    <div className="header-cell">RISK NAME</div>
                    <div className="header-cell">CATEGORIES</div>
                    <div className="header-cell">PRODUCTS</div>
                  </div>
                  <div className="table-body">
                    <div className="status-badge">Not yet loaded</div>
                  </div>
                </div>
              </div>
              
              <div className="categories-section">
                <div className="section-header">
                  <h3>Categories</h3>
                  <Button size="sm">+ Add MidRisk...</Button>
                </div>
                <div className="categories-table">
                  <div className="table-header">
                    <div className="header-cell">RISK ID</div>
                    <div className="header-cell">MIDRISK ID</div>
                    <div className="header-cell">MIDRISK NAME</div>
                    <div className="header-cell">PRODUCTS</div>
                  </div>
                  <div className="table-body">
                    <div className="placeholder-rows">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="placeholder-row">
                          <div className="placeholder-cell"></div>
                          <div className="placeholder-cell"></div>
                          <div className="placeholder-cell"></div>
                          <div className="placeholder-cell"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return <div className="no-data">No content available</div>
    }
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products</h1>
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

      <CreateProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSubmit={handleProductSubmit}
      />
    </div>
  )
}

export default Products
