"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/use-apps"
import { Button } from "./UI/new-button"
import Input from "./UI/input"
import { Label } from "./UI/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./UI/dialog"
import {
  selectUiState,
  setShowCreateUserDialog,
  setShowEditUserDialog,
  setShowChangePasswordDialog,
} from "../features/reducers/uiReducers/uiSlice"
import {
  createUser,
  updateUser,
  changePassword,
  selectUsers,
  clearMessages,
} from "../features/reducers/adminReducers/userSlice"
import type { User, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest } from "../types/user"

export const CreateUser = () => {
  const dispatch = useAppDispatch()
  const { showCreateUserDialog } = useAppSelector(selectUiState)
  const { loading, success, error } = useAppSelector(selectUsers)

  const [formData, setFormData] = useState<CreateUserRequest>({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    address: "",
    email: "",
    phone: "",
    active: true,
  })

  const [errors, setErrors] = useState<Partial<CreateUserRequest>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Partial<CreateUserRequest> = {}
    if (!formData.username.trim()) newErrors.username = "Username is required"
    if (!formData.password.trim()) newErrors.password = "Password is required"
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    dispatch(createUser(formData))
  }

  const handleClose = () => {
    setFormData({
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      address: "",
      email: "",
      phone: "",
      active: true,
    })
    setErrors({})
    dispatch(setShowCreateUserDialog(false))
  }

  const handleChange = (field: keyof CreateUserRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === "active" ? e.target.checked : e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  useEffect(() => {
    if (success.createUser) {
      handleClose()
      dispatch(clearMessages())
    }
  }, [success.createUser, dispatch])

  return (
    <Dialog open={showCreateUserDialog} onOpenChange={handleClose}>
      <DialogContent className="su-create-user-dialog">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="su-user-form">
          <div className="su-form-row">
            <div className="su-form-field">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={handleChange("username")}
                placeholder="Enter username"
                className={errors.username ? "su-error" : ""}
              />
              {errors.username && <span className="su-error-text">{errors.username}</span>}
            </div>

            <div className="su-form-field">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange("password")}
                placeholder="Enter password"
                className={errors.password ? "su-error" : ""}
              />
              {errors.password && <span className="su-error-text">{errors.password}</span>}
            </div>
          </div>

          <div className="su-form-row">
            <div className="su-form-field">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={handleChange("firstName")}
                placeholder="Enter first name"
                className={errors.firstName ? "su-error" : ""}
              />
              {errors.firstName && <span className="su-error-text">{errors.firstName}</span>}
            </div>

            <div className="su-form-field">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={handleChange("lastName")}
                placeholder="Enter last name"
                className={errors.lastName ? "su-error" : ""}
              />
              {errors.lastName && <span className="su-error-text">{errors.lastName}</span>}
            </div>
          </div>

          <div className="su-form-field">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              placeholder="Enter email address"
              className={errors.email ? "su-error" : ""}
            />
            {errors.email && <span className="su-error-text">{errors.email}</span>}
          </div>

          <div className="su-form-row">
            <div className="su-form-field">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={handleChange("phone")} placeholder="Enter phone number" />
            </div>

            <div className="su-form-field">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={formData.address} onChange={handleChange("address")} placeholder="Enter address" />
            </div>
          </div>

          <div className="su-form-field su-checkbox-field">
            <label className="su-checkbox-label">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={handleChange("active")}
                className="su-checkbox-input"
              />
              <span className="su-checkbox-text">Active User</span>
            </label>
          </div>

          {error.createUser && <div className="su-error-message">{error.createUser}</div>}

          <div className="su-form-actions">
            <Button // @ts-ignore
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading.createUser}
            >
              Cancel
            </Button>
            <Button // @ts-ignore
              type="submit"
              disabled={loading.createUser}
              className="su-submit-btn"
            >
              {loading.createUser ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const EditUser = ({ user }: { user: User | null }) => {
  const dispatch = useAppDispatch()
  const { showEditUserDialog } = useAppSelector(selectUiState)
  const { loading, success, error } = useAppSelector(selectUsers)

  const [formData, setFormData] = useState<UpdateUserRequest>({
    username: "",
    firstName: "",
    lastName: "",
    address: "",
    email: "",
    phone: "",
    active: true,
  })

  const [errors, setErrors] = useState<Partial<UpdateUserRequest>>({})

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        address: user.address || "",
        email: user.email || "",
        phone: user.phone || "",
        active: user.active === 1 || user.active === true,
      })
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const newErrors: Partial<UpdateUserRequest> = {}
    if (!formData.username.trim()) newErrors.username = "Username is required"
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    dispatch(updateUser({ id: user.userID, userData: formData }))
  }

  const handleClose = () => {
    setFormData({
      username: "",
      firstName: "",
      lastName: "",
      address: "",
      email: "",
      phone: "",
      active: true,
    })
    setErrors({})
    dispatch(setShowEditUserDialog(false))
  }

  const handleChange = (field: keyof UpdateUserRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === "active" ? e.target.checked : e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  useEffect(() => {
    if (success.updateUser) {
      handleClose()
      dispatch(clearMessages())
    }
  }, [success.updateUser, dispatch])

  return (
    <Dialog open={showEditUserDialog} onOpenChange={handleClose}>
      <DialogContent className="su-edit-user-dialog">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="su-user-form">
          <div className="su-form-row">
            <div className="su-form-field">
              <Label htmlFor="editUsername">Username *</Label>
              <Input
                id="editUsername"
                value={formData.username}
                onChange={handleChange("username")}
                placeholder="Enter username"
                className={errors.username ? "su-error" : ""}
              />
              {errors.username && <span className="su-error-text">{errors.username}</span>}
            </div>
          </div>

          <div className="su-form-row">
            <div className="su-form-field">
              <Label htmlFor="editFirstName">First Name *</Label>
              <Input
                id="editFirstName"
                value={formData.firstName}
                onChange={handleChange("firstName")}
                placeholder="Enter first name"
                className={errors.firstName ? "su-error" : ""}
              />
              {errors.firstName && <span className="su-error-text">{errors.firstName}</span>}
            </div>

            <div className="su-form-field">
              <Label htmlFor="editLastName">Last Name *</Label>
              <Input
                id="editLastName"
                value={formData.lastName}
                onChange={handleChange("lastName")}
                placeholder="Enter last name"
                className={errors.lastName ? "su-error" : ""}
              />
              {errors.lastName && <span className="su-error-text">{errors.lastName}</span>}
            </div>
          </div>

          <div className="su-form-field">
            <Label htmlFor="editEmail">Email *</Label>
            <Input
              id="editEmail"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              placeholder="Enter email address"
              className={errors.email ? "su-error" : ""}
            />
            {errors.email && <span className="su-error-text">{errors.email}</span>}
          </div>

          <div className="su-form-row">
            <div className="su-form-field">
              <Label htmlFor="editPhone">Phone</Label>
              <Input id="editPhone" value={formData.phone} onChange={handleChange("phone")} placeholder="Enter phone number" />
            </div>

            <div className="su-form-field">
              <Label htmlFor="editAddress">Address</Label>
              <Input id="editAddress" value={formData.address} onChange={handleChange("address")} placeholder="Enter address" />
            </div>
          </div>

          <div className="su-form-field su-checkbox-field">
            <label className="su-checkbox-label">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={handleChange("active")}
                className="su-checkbox-input"
              />
              <span className="su-checkbox-text">Active User</span>
            </label>
          </div>

          {error.updateUser && <div className="su-error-message">{error.updateUser}</div>}

          <div className="su-form-actions">
            <Button // @ts-ignore
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading.updateUser}
            >
              Cancel
            </Button>
            <Button // @ts-ignore
              type="submit"
              disabled={loading.updateUser}
              className="su-submit-btn"
            >
              {loading.updateUser ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const ChangePassword = ({ user }: { user: User | null }) => {
  const dispatch = useAppDispatch()
  const { showChangePasswordDialog } = useAppSelector(selectUiState)
  const { loading, success, error } = useAppSelector(selectUsers)

  const [formData, setFormData] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
  })

  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Partial<ChangePasswordRequest & { confirmPassword: string }>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const newErrors: Partial<ChangePasswordRequest & { confirmPassword: string }> = {}
    if (!formData.currentPassword.trim()) newErrors.currentPassword = "Current password is required"
    if (!formData.newPassword.trim()) newErrors.newPassword = "New password is required"
    if (formData.newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    dispatch(changePassword({ userId: user.userID, passwordData: formData }))
  }

  const handleClose = () => {
    setFormData({ currentPassword: "", newPassword: "" })
    setConfirmPassword("")
    setErrors({})
    dispatch(setShowChangePasswordDialog(false))
  }

  const handleChange = (field: keyof ChangePasswordRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
  }

  useEffect(() => {
    if (success.changePassword) {
      handleClose()
      dispatch(clearMessages())
    }
  }, [success.changePassword, dispatch])

  return (
    <Dialog open={showChangePasswordDialog} onOpenChange={handleClose}>
      <DialogContent className="su-change-password-dialog">
        <DialogHeader>
          <DialogTitle>Change Password - {user?.username}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="su-password-form">
          <div className="su-form-field">
            <Label htmlFor="currentPassword">Current Password *</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange("currentPassword")}
              placeholder="Enter current password"
              className={errors.currentPassword ? "su-error" : ""}
            />
            {errors.currentPassword && <span className="su-error-text">{errors.currentPassword}</span>}
          </div>

          <div className="su-form-field">
            <Label htmlFor="newPassword">New Password *</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange("newPassword")}
              placeholder="Enter new password"
              className={errors.newPassword ? "su-error" : ""}
            />
            {errors.newPassword && <span className="su-error-text">{errors.newPassword}</span>}
          </div>

          <div className="su-form-field">
            <Label htmlFor="confirmPassword">Confirm New Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Confirm new password"
              className={errors.confirmPassword ? "su-error" : ""}
            />
            {errors.confirmPassword && <span className="su-error-text">{errors.confirmPassword}</span>}
          </div>

          {error.changePassword && <div className="su-error-message">{error.changePassword}</div>}

          <div className="su-form-actions">
            <Button // @ts-ignore
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading.changePassword}
            >
              Cancel
            </Button>
            <Button // @ts-ignore
              type="submit"
              disabled={loading.changePassword}
              className="su-submit-btn"
            >
              {loading.changePassword ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
