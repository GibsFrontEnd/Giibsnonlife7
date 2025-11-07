"use client"

// @ts-nocheck
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import type { RootState } from "../../../features/store"
import {
  getPolicyByNumber,
  updatePolicy,
  setCurrentPolicy,
} from "../../../features/reducers/underwriteReducers/underwritingSlice"
import { getAllRisks } from "../../../features/reducers/adminReducers/riskSlice"
import { Button } from "../../UI/new-button"
import Input from "../../UI/Input"
import { Label } from "../../UI/label"
import Select from "react-select"
import type { UpdatePolicyRequest } from "../../../types/underwriting"
import "./EditPolicy.css"

const OCCUPATIONS = [
  "Schools",
  "Hospitals",
  "Places of Worship",
  "Residential",
  "Offices",
  "Banks",
  "Hotels",
  "Manufacturing",
  "Retail",
  "Warehouses",
  "Other",
]
const RISK_CLASSIFICATIONS = [
  "Services",
  "Residential and office buildings",
  "Cement plants",
  "Beverage manufacturing",
  "Electrical Industry",
  "Food Processing",
  "Textiles",
  "Chemical plants",
  "Paper and leather",
  "Wood processing",
  "Other",
]

const EditPolicy = () => {
  const { policyNo } = useParams<{ policyNo: string }>()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { currentPolicy, loading, success, error, policies } = useSelector(
    (state: RootState) => state.underwritings,
  )
  const { risks } = useSelector((state: RootState) => state.risks)

  const [formData, setFormData] = useState<UpdatePolicyRequest>({
    surname: "",
    firstName: "",
    insAddress: "",
    insMobilePhone: "",
    insEmail: "",
    insOccupation: "",
    riskLocation: "",
    riskClassification: "",
    businessType: "",
    accountType: "",
    bizSource: "",
    proportionShare: 100,
    ourShare: 100,
    policyExcess: 0,
    remarks: "",
    modifiedBy: "SYSTEM",
  })

  const [validationErrors, setValidationErrors] = useState<string[]>([])

  useEffect(() => {
    // always load risk list
    dispatch(getAllRisks({ pageNumber: 1, pageSize: 100 }) as any)

    if (!policyNo) return

    // try local policies first (DUMMY_POLICIES)
    const local = policies?.find((p: any) => p.policyNo === policyNo)
    if (local) {
      dispatch(setCurrentPolicy(local) as any)
    } else {
      // fallback to API
      dispatch(getPolicyByNumber(policyNo) as any)
    }
  }, [dispatch, policyNo, policies])

  useEffect(() => {
    if (currentPolicy) {
      setFormData({
        surname: currentPolicy.insSurname || "",
        firstName: currentPolicy.insFirstname || "",
        insAddress: currentPolicy.insAddress || "",
        insMobilePhone: currentPolicy.insMobilePhone || "",
        insEmail: currentPolicy.insEmail || "",
        insOccupation: currentPolicy.insOccupation || "",
        riskLocation: currentPolicy.riskLocation || "",
        riskClassification: currentPolicy.riskClassification || "",
        businessType: currentPolicy.businessType || "",
        accountType: currentPolicy.accountType || "",
        bizSource: currentPolicy.bizSource || "",
        proportionShare: currentPolicy.proportionShare ?? 100,
        ourShare: currentPolicy.ourShare ?? 100,
        policyExcess: currentPolicy.policyExcess ?? 0,
        remarks: currentPolicy.remarks || "",
        modifiedBy: "SYSTEM",
      })
    }
  }, [currentPolicy])

  const handleInputChange = (field: keyof UpdatePolicyRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (validationErrors.length > 0) setValidationErrors([])
  }

  const validateForm = (): string[] => {
    const errors: string[] = []
    if (!formData.surname) errors.push("Surname is required")
    if (!formData.insAddress) errors.push("Address is required")
    if (!formData.insMobilePhone) errors.push("Mobile phone is required")
    if (!formData.insEmail) errors.push("Email is required")
    if (formData.insEmail && !/\S+@\S+\.\S+/.test(formData.insEmail)) errors.push("Invalid email")
    return errors
  }

  const handleSubmit = () => {
    const errors = validateForm()
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }
    if (policyNo) {
      dispatch(updatePolicy({ policyNo, policyData: formData }) as any)
      dispatch(getPolicyByNumber(policyNo) as any)
    }
  }

  const handleCancel = () => {
    navigate("/underwriting")
  }

  const handleCalculate = () => {
    if (policyNo) {
      navigate(`/underwritings/calculations/${policyNo}`)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  // show loading only when there's truly no currentPolicy yet
  if (!currentPolicy) {
    return <div className="edit-policy-loading">Loading policy...</div>
  }

  const occupationOptions = OCCUPATIONS.map((occ) => ({ value: occ, label: occ }))
  const riskClassOptions = RISK_CLASSIFICATIONS.map((rc) => ({ value: rc, label: rc }))

  return (
    <div className="edit-policy-container">
      <div className="edit-policy-header">
        <div>
          <h1>Edit Policy</h1>
          <p className="policy-number">Policy No: {currentPolicy.policyNo}</p>
        </div>
        <div className="header-actions">
          <Button onClick={handleCancel} variant="outline">
            Back to List
          </Button>
          <Button onClick={handleCalculate} variant="outline">
            Calculate Premium
          </Button>
          <Button onClick={handleSubmit} disabled={loading.updatePolicy}>
            {loading.updatePolicy ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="edit-policy-content">
        {validationErrors.length > 0 && (
          <div className="validation-errors">
            <h4>Please fix the following errors:</h4>
            <ul>
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {error.updatePolicy && <div className="error-message">{error.updatePolicy}</div>}
        {success.updatePolicy && <div className="success-message">Policy updated successfully!</div>}

        {/* Read-only Policy Information */}
        <div className="form-section readonly-section">
          <h3>Policy Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <Label>Status</Label>
              <div className="info-value">{currentPolicy.status}</div>
            </div>
            <div className="info-item">
              <Label>Product</Label>
              <div className="info-value">{currentPolicy.product}</div>
            </div>
            <div className="info-item">
              <Label>Branch</Label>
              <div className="info-value">{currentPolicy.branch}</div>
            </div>
            <div className="info-item">
              <Label>Effective Date</Label>
              <div className="info-value">{formatDate(currentPolicy.effectiveDate)}</div>
            </div>
            <div className="info-item">
              <Label>Expiry Date</Label>
              <div className="info-value">{formatDate(currentPolicy.expiryDate)}</div>
            </div>
            <div className="info-item">
              <Label>Business Source</Label>
              <div className="info-value">{currentPolicy.bizSource}</div>
            </div>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="form-section">
          <h3>Insured Information (Editable)</h3>
          <div className="form-grid">
            <div className="form-field">
              <Label htmlFor="surname">Surname *</Label>
              <Input
                id="surname"
                value={formData.surname}
                onChange={(e) => handleInputChange("surname", e.target.value)}
                placeholder="Enter surname"
              />
            </div>

            <div className="form-field">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter first name"
              />
            </div>

            <div className="form-field form-field-full">
              <Label htmlFor="insAddress">Address *</Label>
              <textarea
                id="insAddress"
                value={formData.insAddress}
                onChange={(e) => handleInputChange("insAddress", e.target.value)}
                placeholder="Enter address"
                className="form-textarea"
                rows={3}
              />
            </div>

            <div className="form-field">
              <Label htmlFor="insMobilePhone">Mobile Phone *</Label>
              <Input
                id="insMobilePhone"
                value={formData.insMobilePhone}
                onChange={(e) => handleInputChange("insMobilePhone", e.target.value)}
                placeholder="Enter mobile phone"
              />
            </div>

            <div className="form-field">
              <Label htmlFor="insEmail">Email *</Label>
              <Input
                id="insEmail"
                type="email"
                value={formData.insEmail}
                onChange={(e) => handleInputChange("insEmail", e.target.value)}
                placeholder="Enter email"
              />
            </div>

            <div className="form-field">
              <Label htmlFor="insOccupation">Occupation</Label>
              <Select
                options={occupationOptions}
                value={occupationOptions.find((o) => o.value === formData.insOccupation) || null}
                onChange={(opt) => handleInputChange("insOccupation", opt?.value ?? "")}
                placeholder="Select Occupation"
                isClearable
              />
            </div>

            <div className="form-field">
              <Label htmlFor="riskLocation">Risk Location</Label>
              <Input
                id="riskLocation"
                value={formData.riskLocation}
                onChange={(e) => handleInputChange("riskLocation", e.target.value)}
                placeholder="Enter risk location"
              />
            </div>

            <div className="form-field">
              <Label htmlFor="riskClassification">Risk Classification</Label>
              <Select
                options={riskClassOptions}
                value={riskClassOptions.find((r) => r.value === formData.riskClassification) || null}
                onChange={(opt) => handleInputChange("riskClassification", opt?.value ?? "")}
                placeholder="Select Risk Classification"
              />
            </div>

            <div className="form-field">
              <Label htmlFor="proportionShare">Proportion Share (%)</Label>
              <Input
                id="proportionShare"
                type="number"
                min={0}
                max={100}
                value={formData.proportionShare}
                onChange={(e) => handleInputChange("proportionShare", Number(e.target.value))}
              />
            </div>

            <div className="form-field">
              <Label htmlFor="ourShare">Our Share (%)</Label>
              <Input
                id="ourShare"
                type="number"
                min={0}
                max={100}
                value={formData.ourShare}
                onChange={(e) => handleInputChange("ourShare", Number(e.target.value))}
              />
            </div>

            <div className="form-field">
              <Label htmlFor="policyExcess">Policy Excess</Label>
              <Input
                id="policyExcess"
                type="number"
                min={0}
                value={formData.policyExcess}
                onChange={(e) => handleInputChange("policyExcess", Number(e.target.value))}
              />
            </div>

            <div className="form-field form-field-full">
              <Label htmlFor="remarks">Remarks</Label>
              <textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                placeholder="Enter remarks"
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditPolicy
