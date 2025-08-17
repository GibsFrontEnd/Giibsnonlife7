import React, { useState } from 'react'
import Modal from '../ui/modal'
import Button from '../ui/button'
import Input from '../ui/input'
import FormField from '../ui/formField'

interface CreateRoleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    roleId: '',
    roleName: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      roleId: '',
      roleName: ''
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
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Role" size="sm">
      <form onSubmit={handleSubmit}>
        <FormField label="Role ID">
          <Input
            value={formData.roleId}
            onChange={handleChange('roleId')}
            required
          />
        </FormField>

        <FormField label="Role Name">
          <Input
            value={formData.roleName}
            onChange={handleChange('roleName')}
            required
          />
        </FormField>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <Button type="submit">
            📄 Create Role
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateRoleModal
