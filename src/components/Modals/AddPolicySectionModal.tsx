"use client"

//@ts-nocheck
import { useState } from "react"
import { useDispatch } from "react-redux"
import { Button } from "../UI/new-button"
import Input from "../UI/Input"
import { Label } from "../UI/label"
import "./AddPolicySectionModal.css"

interface AddPolicySectionModalProps {
  isOpen: boolean
  policyNo: string
  onClose: () => void
  onSave: (sections: any[]) => void
}

const AddPolicySectionModal = ({ isOpen, policyNo, onClose, onSave }: AddPolicySectionModalProps) => {
  const dispatch = useDispatch()
  const [sections, setSections] = useState<any[]>([])
  const [currentSection, setCurrentSection] = useState({
    sectionName: "",
    riskItems: [{ itemNo: 1, smiCode: "", itemDescription: "", sumInsured: 0, rate: 0, multiplier: 1, premium: 0 }],
  })

  const SECTION_OPTIONS = [
    "BUILDING",
    "ELECTRICAL INSTALLATIONS",
    "FURNITURE, FIXTURES & FITTINGS",
    "LOSS OF RENT",
    "PERSONAL EFFECTS",
    "OTHER CONTENTS",
  ]

  const handleAddRiskItem = () => {
    setCurrentSection((prev) => ({
      ...prev,
      riskItems: [
        ...prev.riskItems,
        {
          itemNo: prev.riskItems.length + 1,
          smiCode: "",
          itemDescription: "",
          sumInsured: 0,
          rate: 0,
          multiplier: 1,
          premium: 0,
        },
      ],
    }))
  }

  const handleRemoveRiskItem = (index: number) => {
    setCurrentSection((prev) => ({
      ...prev,
      riskItems: prev.riskItems.filter((_, i) => i !== index),
    }))
  }

  const handleRiskItemChange = (index: number, field: string, value: any) => {
    setCurrentSection((prev) => {
      const updated = [...prev.riskItems]
      updated[index] = { ...updated[index], [field]: value }

      // Auto-calculate premium
      if (field === "sumInsured" || field === "rate" || field === "multiplier") {
        const sumInsured = Number.parseFloat(updated[index].sumInsured) || 0
        const rate = Number.parseFloat(updated[index].rate) || 0
        const multiplier = Number.parseFloat(updated[index].multiplier) || 1
        updated[index].premium = (sumInsured * rate * multiplier) / 100
      }

      return { ...prev, riskItems: updated }
    })
  }

  const handleAddSection = () => {
    if (currentSection.sectionName) {
      setSections((prev) => [...prev, { ...currentSection, sectionID: Date.now() }])
      setCurrentSection({
        sectionName: "",
        riskItems: [{ itemNo: 1, smiCode: "", itemDescription: "", sumInsured: 0, rate: 0, multiplier: 1, premium: 0 }],
      })
    }
  }

  const handleRemoveSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    onSave(sections)
    handleClose()
  }

  const handleClose = () => {
    setSections([])
    setCurrentSection({
      sectionName: "",
      riskItems: [{ itemNo: 1, smiCode: "", itemDescription: "", sumInsured: 0, rate: 0, multiplier: 1, premium: 0 }],
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="apsm-modal-overlay">
      <div className="apsm-modal-content">
        <div className="apsm-modal-header">
          <h2>Add Policy Sections</h2>
          <button className="apsm-close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="apsm-modal-body">
          {/* Current Section Form */}
          <div className="apsm-form-section">
            <h4>New Section Details</h4>
            <div className="apsm-form-grid">
              <div className="apsm-form-field">
                <Label htmlFor="sectionName">Section Name *</Label>
                <select
                  id="sectionName"
                  className="apsm-select"
                  value={currentSection.sectionName}
                  onChange={(e) => setCurrentSection((prev) => ({ ...prev, sectionName: e.target.value }))}
                >
                  <option value="">Select Section</option>
                  {SECTION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Risk Items Table */}
            <div className="apsm-risk-items">
              <div className="apsm-items-header">
                <h5>Risk Items</h5>
                <Button onClick={handleAddRiskItem} variant="outline" size="sm">
                  + Add Item
                </Button>
              </div>

              <div className="apsm-items-table-wrapper">
                <table className="apsm-items-table">
                  <thead>
                    <tr>
                      <th>SMI Code</th>
                      <th>Description</th>
                      <th>Sum Insured</th>
                      <th>Rate (%)</th>
                      <th>Multiplier</th>
                      <th>Premium</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSection.riskItems.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <Input
                            value={item.smiCode}
                            onChange={(e) => handleRiskItemChange(index, "smiCode", e.target.value)}
                            placeholder="SMI Code"
                            className="apsm-input-cell"
                          />
                        </td>
                        <td>
                          <Input
                            value={item.itemDescription}
                            onChange={(e) => handleRiskItemChange(index, "itemDescription", e.target.value)}
                            placeholder="Description"
                            className="apsm-input-cell"
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            value={item.sumInsured}
                            onChange={(e) => handleRiskItemChange(index, "sumInsured", Number(e.target.value))}
                            placeholder="0"
                            className="apsm-input-cell"
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleRiskItemChange(index, "rate", Number(e.target.value))}
                            placeholder="0"
                            className="apsm-input-cell"
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            value={item.multiplier}
                            onChange={(e) => handleRiskItemChange(index, "multiplier", Number(e.target.value))}
                            placeholder="1"
                            className="apsm-input-cell"
                          />
                        </td>
                        <td>
                          <div className="apsm-premium-cell">{item.premium.toFixed(2)}</div>
                        </td>
                        <td>
                          <Button
                            onClick={() => handleRemoveRiskItem(index)}
                            variant="outline"
                            size="sm"
                            className="apsm-delete-btn"
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button
                onClick={handleAddSection}
                disabled={!currentSection.sectionName}
                className="apsm-add-section-btn"
              >
                Add This Section
              </Button>
            </div>
          </div>

          {/* Added Sections List */}
          {sections.length > 0 && (
            <div className="apsm-sections-list">
              <h4>Added Sections ({sections.length})</h4>
              {sections.map((section, index) => (
                <div key={section.sectionID} className="apsm-section-card">
                  <div className="apsm-section-header">
                    <div>
                      <strong>{section.sectionName}</strong>
                      <span className="apsm-item-count">{section.riskItems.length} items</span>
                    </div>
                    <Button
                      onClick={() => handleRemoveSection(index)}
                      variant="outline"
                      size="sm"
                      className="apsm-remove-section-btn"
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="apsm-section-items">
                    {section.riskItems.map((item: any, itemIndex: number) => (
                      <div key={itemIndex} className="apsm-item-summary">
                        <span>{item.itemDescription || "No description"}</span>
                        <span className="apsm-item-premium">{item.premium.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="apsm-modal-footer">
          <Button onClick={handleClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={sections.length === 0}>
            Save Sections
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AddPolicySectionModal
