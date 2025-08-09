import React, { useState } from 'react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import Input from '../UI/Input'
import FormField from '../UI/FormField'

interface CreateProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    risk: '',
    midRisk: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      productId: '',
      productName: '',
      risk: '',
      midRisk: ''
    })
    onClose()
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Product">
      <form onSubmit={handleSubmit}>
        <FormField label="Product ID">
          <Input
            value={formData.productId}
            onChange={handleChange('productId')}
            required
          />
        </FormField>

        <FormField label="Product Name">
          <Input
            value={formData.productName}
            onChange={handleChange('productName')}
            required
          />
        </FormField>

        <FormField label="Risk">
          <Input
            value={formData.risk}
            onChange={handleChange('risk')}
            required
          />
        </FormField>

        <FormField label="Mid Risk">
          <Input
            value={formData.midRisk}
            onChange={handleChange('midRisk')}
            required
          />
        </FormField>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <Button type="submit">
            📄 Create Product
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateProductModal
