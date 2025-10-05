//@ts-nocheck

import { useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import Select from "react-select"

import type { RootState } from "../../../features/store"
import { useSelector } from "react-redux"
import { createProposal, clearMessages } from "../../../features/reducers/quoteReducers/quotationSlice"
import { getAllRisks } from "../../../features/reducers/adminReducers/riskSlice"
import { getAllProducts } from "../../../features/reducers/productReducers/productSlice"
import { getAllBranches } from "../../../features/reducers/companyReducers/branchSlice"
import { getAllAgents } from "../../../features/reducers/csuReducers/agentSlice"
import { getAllCustomers } from "@/features/reducers/csuReducers/customerSlice"
import { fetchMktStaffs, selectMarketingStaff } from "@/features/reducers/companyReducers/marketingStaffSlice"

import { Button } from "../../UI/new-button"
import Input from "../../UI/Input"
import { Label } from "../../UI/label"
import type { CreateProposalRequest } from "../../../types/quotation"
import { useAppSelector } from "@/hooks/use-apps"

import "./CreateProposal.css"

const CreateProposal = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const errorRef = useRef<HTMLDivElement | null>(null)

  const { loading, success, error } = useSelector((state: RootState) => state.quotations)
  const { risks } = useSelector((state: RootState) => state.risks)
  const { products } = useSelector((state: RootState) => state.products)
  const { branches } = useSelector((state: RootState) => state.branches)
  const { customers } = useSelector((state: RootState) => state.customers)
  const { agents } = useSelector((state: RootState) => state.parties)
  const { mktStaffs} = useAppSelector(selectMarketingStaff)

  const [insuredType, setInsuredType] = useState<"individual" | "organization">("individual")
  const [riskClass, setRiskClass] = useState("")
  const [formData, setFormData] = useState<CreateProposalRequest>({
    subriskID:"",
    branchID: "",
    insuredID:"",
    partyID: "",
    mktStaffID: "",
    startDate: "",
    endDate: "",
    insAddress: "",
    insMobilePhone: "",
    insEmail: "",
    insOccupation: "",
    bizSource: "DIRECT",
    proportionRate: 100,
    currency: "NGN",
    exRate: 1,
    surname: "",
    firstName: "",
    otherNames: "",
    isOrg: false,
  })
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Fetch all data on mount
  useEffect(() => {
    dispatch(getAllRisks({ pageNumber: 1, pageSize: 100 }) as any)
    dispatch(getAllBranches() as any)
    dispatch(getAllAgents({ pageNumber: 1, pageSize: 100 }) as any)
    dispatch(fetchMktStaffs() as any)
    dispatch(getAllCustomers() as any)
  }, [dispatch])

  // Fetch products when riskClass changes
  useEffect(() => {
    if (riskClass) {
      dispatch(getAllProducts({ riskId: riskClass, pageNumber: 1, pageSize: 100 }) as any)
    }
  }, [dispatch, riskClass])

  // Navigate after success
  useEffect(() => {
    if (success.createProposal) {
      navigate("/quotations")
      dispatch(clearMessages())
    }
  }, [success.createProposal, navigate, dispatch])

  const handleInputChange = (field: keyof CreateProposalRequest, value: any) => {
    
    setFormData(prev => ({ ...prev, [field]: value }))
    if (validationErrors.length > 0) setValidationErrors([])
  }

  const validateForm = (): string[] => {
    const errors: string[] = []

    if (!riskClass) errors.push("Business category is required")
    if (!formData.branchID) errors.push("Branch is required")
    if (insuredType === "individual") {
      if (!formData.surname) errors.push("Surname is required")
      if (!formData.firstName) errors.push("First name is required")
    } else {
      if (!formData.insuredID) errors.push("Company name is required")
    }
    if (!formData.partyID) errors.push("Agent is required")
    if (!formData.mktStaffID) errors.push("Marketing staff is required")
    if (!formData.startDate) errors.push("Start date is required")
    if (!formData.endDate) errors.push("End date is required")
    if (!formData.insAddress) errors.push("Address is required")
    if (!formData.insMobilePhone) errors.push("Mobile phone is required")
    if (!formData.insEmail) errors.push("Email is required")

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      errors.push("End date must be after start date")
    }

    if (formData.insEmail && !/\S+@\S+\.\S+/.test(formData.insEmail)) {
      errors.push("Please enter a valid email address")
    }

    return errors
  }

  const handleSubmit = () => {
    const errors = validateForm()
    if (errors.length > 0) {
      setValidationErrors(errors)
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }

    dispatch(createProposal(formData) as any)
  }

  const handleCancel = () => {
    navigate("/quotations")
  }

  // Filtered options
  const filteredProducts = products.filter(p => p.riskID === riskClass)
  const productOptions = filteredProducts.map(p => ({ value: p.productID, label: p.productName }))
  const branchOptions = branches.map(b => ({ value: b.branchID, label: b.description }))
  const agentOptions = agents.map(a => ({ value: a.partyID, label: a.party }))
  const mktStaffOptions = mktStaffs.map(s => ({ value: s.mktStaffID, label: s.staffName }))
  const individualCustomerOptions = customers
    .filter(c => c.insuredType !== "Corporate")
    .map(c => ({
      value: c.insuredID,
      label: c.firstName && c.lastName ? `${c.firstName} ${c.lastName}` : c.orgName
    }))
  const companyCustomerOptions = customers
    .filter(c => c.insuredType === "Corporate")
    .map(c => ({ value: c.insuredID, label: c.fullName }))

    

  return (
    <div className="create-proposal-container">
      <div className="create-proposal-header">
        <h1>Create New Proposal</h1>
        <div className="header-actions">
          <Button onClick={handleCancel} variant="outline">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading.createProposal}>
            {loading.createProposal ? "Creating..." : "Create Proposal"}
          </Button>
        </div>
      </div>

      <div className="create-proposal-form" ref={errorRef}>
        {validationErrors.length > 0 && (
          <div className="validation-errors">
            <h4>Please fix the following errors:</h4>
            <ul>
              {validationErrors.map((error, i) => <li key={i}>{error}</li>)}
            </ul>
          </div>
        )}

        {error.createProposal && <div className="error-message">{error.createProposal}</div>}

        {/* Business Information */}
        <div className="form-section">
          <h3>Business Information</h3>
          <div className="form-grid">
            <div className="form-field">
              <Label htmlFor="riskClass">Business Category *</Label>
              <Select
                options={risks.map(r => ({ value: r.riskID, label: r.riskName }))}
                value={riskClass ? { value: riskClass, label: risks.find(r => r.riskID === riskClass)?.riskName } : null}
                onChange={opt => setRiskClass(opt?.value ?? "")}
                placeholder="Select Business Category"
                isClearable
              />
            </div>

            <div className="form-field">
              <Label htmlFor="subriskID">Subclass / Product *</Label>
              <Select
                options={productOptions}
                value={productOptions.find(p => p.value === formData.subriskID) || null}
                onChange={opt => handleInputChange("subriskID", opt?.value ?? "")}
                placeholder="Select Subclass"
                isDisabled={!riskClass}
                isClearable
              />
            </div>

            <div className="form-field">
              <Label htmlFor="branchID">Branch *</Label>
              <Select
                options={branchOptions}
                value={branchOptions.find(b => b.value === formData.branchID) || null}
                onChange={opt => handleInputChange("branchID", opt?.value ?? "")}
                placeholder="Select Branch"
              />
            </div>

            <div className="form-field">
              <Label htmlFor="bizSource">Business Source *</Label>
              <Select
                options={[
                  { value: "DIRECT", label: "Direct" },
                  { value: "BROKER", label: "Broker" },
                  { value: "AGENT", label: "Agent" }
                ]}
                value={{ value: formData.bizSource, label: formData.bizSource }}
                onChange={opt => handleInputChange("bizSource", opt?.value ?? "DIRECT")}
              />
            </div>
          </div>
        </div>

        {/* Insured Information */}
        <div className="form-section">
          <h3>Insured Information</h3>

          <div className="insured-type-toggle">
            <Label>Insured Type</Label>
            <div className="toggle-buttons">
              <button
                type="button"
                className={`toggle-btn ${insuredType === "individual" ? "active" : ""}`}
                onClick={() => setInsuredType("individual")}
              >
                Individual
              </button>
              <button
                type="button"
                className={`toggle-btn ${insuredType === "organization" ? "active" : ""}`}
                onClick={() => setInsuredType("organization")}
              >
                Organization
              </button>
            </div>
          </div>

          <div className="form-grid">
            {insuredType === "individual" ? (
              <>
                <div className="form-field form-field-full">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Select
                    options={individualCustomerOptions}
                    value={individualCustomerOptions.find(c => c.value === formData.insuredID) || null}
                    onChange={opt => {
                      if (!opt) {
                        handleInputChange("insuredID", "")
                        handleInputChange("surname", "")
                        handleInputChange("firstName", "")
                        return
                      }
                      const customer = customers.find(c => c.insuredID === opt.value)
                      if (customer) {
                        handleInputChange("insuredID", customer.insuredID)
                        handleInputChange("surname", customer.lastName ?? "")
                        handleInputChange("firstName", customer.firstName ?? "")
                      }
                    }}
                    placeholder="Select Customer"
                    isClearable
                  />
                </div>

                <div className="form-field">
                  <Label htmlFor="surname">Surname *</Label>
                  <Input
                    id="surname"
                    value={formData.surname}
                    onChange={e => handleInputChange("surname", e.target.value)}
                    placeholder="Enter surname"
                  />
                </div>

                <div className="form-field">
                  <Label htmlFor="firstname">First Name *</Label>
                  <Input
                    id="firstname"
                    value={formData.firstName}
                    onChange={e => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
              </>
            ) : (
              <div className="form-field form-field-full">
                <Label htmlFor="companyName">Company Name *</Label>
                <Select
                  options={companyCustomerOptions}
                  value={companyCustomerOptions.find(c => c.value === formData.insuredID) || null}
                  onChange={opt => handleInputChange("insuredID", opt?.value ?? "")}
                  placeholder="Select Company"
                  isClearable
                />
              </div>
            )}

            <div className="form-field form-field-full">
              <Label htmlFor="insAddress">Address *</Label>
              <textarea
                id="insAddress"
                value={formData.insAddress}
                onChange={e => handleInputChange("insAddress", e.target.value)}
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
                onChange={e => handleInputChange("insMobilePhone", e.target.value)}
                placeholder="Enter mobile phone"
              />
            </div>

            <div className="form-field">
              <Label htmlFor="insEmail">Email *</Label>
              <Input
                id="insEmail"
                type="email"
                value={formData.insEmail}
                onChange={e => handleInputChange("insEmail", e.target.value)}
                placeholder="Enter email"
              />
            </div>

            <div className="form-field">
              <Label htmlFor="insOccupation">Occupation</Label>
              <Input
                id="insOccupation"
                value={formData.insOccupation}
                onChange={e => handleInputChange("insOccupation", e.target.value)}
                placeholder="Enter occupation"
              />
            </div>
          </div>
        </div>

        {/* Agent & Marketing Staff */}
        <div className="form-section">
          <h3>Agent & Marketing Information</h3>
          <div className="form-grid">
            <div className="form-field">
              <Label htmlFor="partyID">Agent *</Label>
              <Select
                options={agentOptions}
                value={agentOptions.find(a => a.value === formData.partyID) || null}
                onChange={opt => handleInputChange("partyID", opt?.value ?? "")}
                placeholder="Select Agent"
                isClearable
              />
            </div>

            <div className="form-field">
              <Label htmlFor="mktStaffID">Marketing Staff *</Label>
              <Select
                options={mktStaffOptions}
                value={mktStaffOptions.find(s => s.value === formData.mktStaffID) || null}
                onChange={opt => handleInputChange("mktStaffID", opt?.value ?? "")}
                placeholder="Select Marketing Staff"
                isClearable
              />
            </div>
          </div>
        </div>

        {/* Policy Period */}
        <div className="form-section">
          <h3>Policy Period</h3>
          <div className="form-grid">
            <div className="form-field">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={e => handleInputChange("startDate", e.target.value)}
              />
            </div>

            <div className="form-field">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={e => handleInputChange("endDate", e.target.value)}
              />
            </div>

            <div className="form-field">
              <Label htmlFor="proportionRate">Proportion Rate (%)</Label>
              <Input
                id="proportionRate"
                type="number"
                min={0}
                max={100}
                value={formData.proportionRate}
                onChange={e => handleInputChange("proportionRate", Number(e.target.value))}
              />
            </div>

            <div className="form-field">
              <Label htmlFor="currency">Currency</Label>
              <Select
                options={[
                  { value: "NGN", label: "NGN - Nigerian Naira" },
                  { value: "USD", label: "USD - US Dollar" },
                  { value: "EUR", label: "EUR - Euro" },
                  { value: "GBP", label: "GBP - British Pound" }
                ]}
                value={{ value: formData.currency, label: formData.currency }}
                onChange={opt => handleInputChange("currency", opt?.value ?? "NGN")}
              />
            </div>

            <div className="form-field">
              <Label htmlFor="exRate">Exchange Rate</Label>
              <Input
                id="exRate"
                type="number"
                min={0}
                step={0.01}
                value={formData.exRate}
                onChange={e => handleInputChange("exRate", Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="footer-actions">
          <Button onClick={handleCancel} variant="outline">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading.createProposal}>
            {loading.createProposal ? "Creating..." : "Create Proposal"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreateProposal
