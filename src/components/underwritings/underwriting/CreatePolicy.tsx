//@ts-nocheck
import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import Select from "react-select"
import type { RootState } from "../../../features/store"
import { createPolicy, clearMessages } from "../../../features/reducers/underwriteReducers/underwritingSlice"
import { getAllRisks } from "../../../features/reducers/adminReducers/riskSlice"
import { getAllProducts } from "../../../features/reducers/productReducers/productSlice"
import { getAllBranches } from "../../../features/reducers/companyReducers/branchSlice"
import { getAllAgents } from "../../../features/reducers/csuReducers/agentSlice"
import { getAllCustomers } from "../../../features/reducers/csuReducers/customerSlice"
import { fetchMktStaffs } from "../../../features/reducers/companyReducers/marketingStaffSlice"
import { Button } from "../../UI/new-button"
import Input from "../../UI/Input"
import { Label } from "../../UI/label"
import type { CreatePolicyRequest } from "../../../types/underwriting"
import "./CreatePolicy.css"

const OCCUPATIONS = [
  "Schools",
  "Hospitals",
  "Places of Worship",
  "Residential buildings",
  "Office buildings",
  "Banks",
  "Hotels/Restaurants",
  "Manufacturing",
  "Retail",
  "Warehouses",
  "Other",
]

const RISK_CLASSIFICATIONS = [
  "Services (schools, hospitals)",
  "Residential and office buildings",
  "Cement plants and stone crushing",
  "Beverage manufacturing",
  "Electrical Industry",
  "Food Processing",
  "Textiles",
  "Chemical plants",
  "Paper and leather",
  "Wood processing",
  "Other",
]

const CreatePolicy = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const errorRef = useRef<HTMLDivElement | null>(null)

  const { loading, success, error, marketingStaffs } = useSelector((state: RootState) => state.underwritings)
  const { risks } = useSelector((state: RootState) => state.risks)
  const { products } = useSelector((state: RootState) => state.products)
  const { branches } = useSelector((state: RootState) => state.branches)
  const { customers } = useSelector((state: RootState) => state.customers)
  const { agents } = useSelector((state: RootState) => state.parties)

  const [insuredType, setInsuredType] = useState<"individual" | "corporate">("individual")
  const [riskClass, setRiskClass] = useState("")
  const [formData, setFormData] = useState<CreatePolicyRequest>({
    product: "",
    productID: "",
    branchID: "",
    insuredName: "",
    insuredID: "",
    partyID: "",
    mktStaffID: "",
    entryDate: new Date().toISOString().split("T")[0],
    effectiveDate: "",
    expiryDate: "",
    businessType: "DIRECT",
    accountType: "100%",
    bizSource: "DIRECT",
    insAddress: "",
    insMobilePhone: "",
    insEmail: "",
    insOccupation: "",
    riskLocation: "",
    riskClassification: "",
    currency: "NGN",
    exRate: 1,
    proportionShare: 100,
    ourShare: 100,
    isOrg: false,
  })
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  useEffect(() => {
    dispatch(getAllRisks({ pageNumber: 1, pageSize: 100 }) as any)
    dispatch(getAllBranches() as any)
    dispatch(getAllAgents({ pageNumber: 1, pageSize: 100 }) as any)
    dispatch(fetchMktStaffs() as any)
    dispatch(getAllCustomers({ pageNumber: 1, pageSize: 50, insuredType: insuredType }) as any)
  }, [dispatch])

  useEffect(() => {
    if (riskClass) {
      dispatch(getAllProducts({ riskId: riskClass, pageNumber: 1, pageSize: 100 }) as any)
    }
  }, [dispatch, riskClass])

  useEffect(() => {
    if (success.createPolicy) {
      navigate("/underwriting")
      dispatch(clearMessages())
    }
  }, [success.createPolicy, navigate, dispatch])

  const handleInputChange = (field: keyof CreatePolicyRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (validationErrors.length > 0) setValidationErrors([])
  }

  const validateForm = (): string[] => {
    const errors: string[] = []

    if (!riskClass) errors.push("Risk/Business category is required")
    if (!formData.productID) errors.push("Product is required")
    if (!formData.branchID) errors.push("Branch is required")
    if (!formData.partyID) errors.push("Agent/Broker is required")
    if (!formData.mktStaffID) errors.push("Marketing staff is required")
    if (!formData.entryDate) errors.push("Entry date is required")
    if (!formData.effectiveDate) errors.push("Effective date is required")
    if (!formData.expiryDate) errors.push("Expiry date is required")
    if (insuredType === "individual") {
      if (!formData.surname) errors.push("Surname is required")
      if (!formData.firstName) errors.push("First name is required")
    } else {
      if (!formData.insuredID) errors.push("Company name is required")
    }
    if (!formData.insAddress) errors.push("Risk location is required")
    if (!formData.insMobilePhone) errors.push("Mobile phone is required")
    if (!formData.insEmail) errors.push("Email is required")
    if (!formData.riskClassification) errors.push("Risk classification is required")

    if (
      formData.effectiveDate &&
      formData.expiryDate &&
      new Date(formData.effectiveDate) >= new Date(formData.expiryDate)
    ) {
      errors.push("Expiry date must be after effective date")
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

    dispatch(createPolicy(formData) as any)
  }

  const handleCancel = () => {
    navigate("/underwriting")
  }

  const filteredProducts = products.filter((p) => p.riskID === riskClass)
  const productOptions = filteredProducts.map((p) => ({ value: p.productID, label: p.productName }))
  const branchOptions = branches.map((b) => ({ value: b.branchID, label: b.description }))
  const agentOptions = agents.map((a) => ({ value: a.partyID, label: a.party }))
  const mktStaffOptions = marketingStaffs.map((staff) => ({ value: staff.id, label: staff.name }))

  return (
    <div className="create-policy-container">
      <div className="create-policy-header">
        <h1>Create New Policy</h1>
        <div className="header-actions">
          <Button onClick={handleCancel} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading.createPolicy}>
            {loading.createPolicy ? "Creating..." : "Create Policy"}
          </Button>
        </div>
      </div>

      <div className="create-policy-form" ref={errorRef}>
        {validationErrors.length > 0 && (
          <div className="validation-errors">
            <h4>Please fix the following errors:</h4>
            <ul>
              {validationErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {error.createPolicy && <div className="error-message">{error.createPolicy}</div>}

        {/* Policy Information */}
        <div className="form-section">
          <h3>Policy Information</h3>
          <div className="form-grid">
            <div className="form-field">
              <Label htmlFor="product">Product *</Label>
              <Select
                options={productOptions.length > 0 ? productOptions : [{ value: "", label: "No products available" }]}
                value={
                  formData.productID
                    ? {
                        value: formData.productID,
                        label: productOptions.find((p) => p.value === formData.productID)?.label || "",
                      }
                    : null
                }
                onChange={(opt) => {
                  handleInputChange("productID", opt?.value ?? "")
                  const product = products.find((p) => p.productID === opt?.value)
                  if (product) handleInputChange("product", product.productName)
                }}
                placeholder="Select Product"
              />
            </div>

            <div className="form-field">
              <Label htmlFor="branchID">Branch/Location *</Label>
              <Select
                options={branchOptions}
                value={branchOptions.find((b) => b.value === formData.branchID) || null}
                onChange={(opt) => handleInputChange("branchID", opt?.value ?? "")}
                placeholder="Select Branch"
              />
            </div>

            <div className="form-field">
              <Label htmlFor="entryDate">Entry Date *</Label>
              <Input
                id="entryDate"
                type="date"
                value={formData.entryDate}
                onChange={(e) => handleInputChange("entryDate", e.target.value)}
              />
            </div>

            <div className="form-field">
              <Label htmlFor="mktStaffID">Marketing Staff *</Label>
              <Select
                options={mktStaffOptions}
                value={mktStaffOptions.find((m) => m.value === formData.mktStaffID) || null}
                onChange={(opt) => handleInputChange("mktStaffID", opt?.value ?? "")}
                placeholder="Select Marketing Staff"
              />
            </div>

            <div className="form-field">
              <Label htmlFor="effectiveDate">Effective Date *</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => {
                  handleInputChange("effectiveDate", e.target.value)
                  if (e.target.value) {
                    const startDate = new Date(e.target.value)
                    const endDate = new Date(startDate)
                    endDate.setFullYear(endDate.getFullYear() + 1)
                    handleInputChange("expiryDate", endDate.toISOString().split("T")[0])
                  }
                }}
              />
            </div>

            <div className="form-field">
              <Label htmlFor="expiryDate">Expiry Date *</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange("expiryDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="form-section">
          <h3>Business Information</h3>
          <div className="form-grid">
            <div className="form-field">
              <Label htmlFor="businessType">Business Type *</Label>
              <Select
                options={[
                  { value: "DIRECT_NO_COINSURANCE", label: "DIRECT Without Coinsurance" },
                  { value: "DIRECT_COINSURANCE", label: "DIRECT With Coinsurance" },
                  { value: "INWARD_COINSURANCE", label: "INWARD COINSURANCE" },
                  { value: "FACULTATIVE", label: "FACULTATIVE INWARD" },
                ]}
                value={{ value: formData.businessType, label: formData.businessType }}
                onChange={(opt) => handleInputChange("businessType", opt?.value ?? "")}
              />
            </div>

            <div className="form-field">
              <Label htmlFor="accountType">Account Type *</Label>
              <Select
                options={[
                  { value: "100%", label: "100% Accounting" },
                  { value: "OUR_SHARE", label: "Our Share Accounting" },
                  { value: "PROPORTION", label: "Proportion" },
                ]}
                value={{ value: formData.accountType, label: formData.accountType }}
                onChange={(opt) => handleInputChange("accountType", opt?.value ?? "")}
              />
            </div>

            <div className="form-field">
              <Label htmlFor="bizSource">Business Source *</Label>
              <Select
                options={[
                  { value: "DIRECT", label: "Direct" },
                  { value: "DIRECT_COMMISSION", label: "Direct With Commission" },
                  { value: "AGENTS", label: "Agents" },
                  { value: "BROKERS", label: "Brokers" },
                  { value: "BANC_ASSURANCE", label: "Banc Assurance" },
                  { value: "E_CHANNEL", label: "E-Channel" },
                ]}
                value={{ value: formData.bizSource, label: formData.bizSource }}
                onChange={(opt) => handleInputChange("bizSource", opt?.value ?? "")}
              />
            </div>

            <div className="form-field">
              <Label htmlFor="partyID">Agent/Broker *</Label>
              <Select
                options={agentOptions}
                value={agentOptions.find((a) => a.value === formData.partyID) || null}
                onChange={(opt) => handleInputChange("partyID", opt?.value ?? "")}
                placeholder="Select Agent/Broker"
              />
            </div>
          </div>
        </div>

        {/* Insured Information */}
        <div className="form-section">
          <h3>Insured Details</h3>

          <div className="insured-type-toggle">
            <Label>Insured Type</Label>
            <div className="toggle-buttons">
              <button
                type="button"
                className={`toggle-btn ${insuredType === "individual" ? "active" : ""}`}
                onClick={() => {
                  setInsuredType("individual")
                  setFormData((prev) => ({ ...prev, isOrg: false }))
                }}
              >
                Individual
              </button>
              <button
                type="button"
                className={`toggle-btn ${insuredType === "corporate" ? "active" : ""}`}
                onClick={() => {
                  setInsuredType("corporate")
                  setFormData((prev) => ({ ...prev, isOrg: true }))
                }}
              >
                Organization
              </button>
            </div>
          </div>

          <div className="form-grid">
            {insuredType === "individual" ? (
              <>
                <div className="form-field">
                  <Label htmlFor="surname">Surname *</Label>
                  <Input
                    id="surname"
                    value={formData.surname || ""}
                    onChange={(e) => handleInputChange("surname", e.target.value)}
                    placeholder="Enter surname"
                  />
                </div>

                <div className="form-field">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName || ""}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>

                <div className="form-field form-field-full">
                  <Label htmlFor="otherNames">Other Names</Label>
                  <Input
                    id="otherNames"
                    value={formData.otherNames || ""}
                    onChange={(e) => handleInputChange("otherNames", e.target.value)}
                    placeholder="Enter other names"
                  />
                </div>
              </>
            ) : (
              <div className="form-field form-field-full">
                <Label htmlFor="insuredID">Company Name *</Label>
                <Input
                  id="insuredID"
                  value={formData.insuredID}
                  onChange={(e) => handleInputChange("insuredID", e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
            )}

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
                options={OCCUPATIONS.map((occ) => ({ value: occ, label: occ }))}
                value={formData.insOccupation ? { value: formData.insOccupation, label: formData.insOccupation } : null}
                onChange={(opt) => handleInputChange("insOccupation", opt?.value ?? "")}
                placeholder="Select Occupation"
                isClearable
              />
            </div>
          </div>
        </div>

        {/* Risk Information */}
        <div className="form-section">
          <h3>Risk Information</h3>
          <div className="form-grid">
            <div className="form-field">
              <Label htmlFor="riskLocation">Risk Location *</Label>
              <Input
                id="riskLocation"
                value={formData.riskLocation}
                onChange={(e) => handleInputChange("riskLocation", e.target.value)}
                placeholder="Enter risk location"
              />
            </div>

            <div className="form-field form-field-full">
              <Label htmlFor="riskClassification">Risk Classification *</Label>
              <Select
                options={RISK_CLASSIFICATIONS.map((rc) => ({ value: rc, label: rc }))}
                value={
                  formData.riskClassification
                    ? { value: formData.riskClassification, label: formData.riskClassification }
                    : null
                }
                onChange={(opt) => handleInputChange("riskClassification", opt?.value ?? "")}
                placeholder="Select Risk Classification"
              />
            </div>
          </div>
        </div>

        {/* Proportion & Currency */}
        <div className="form-section">
          <h3>Proportion & Currency</h3>
          <div className="form-grid">
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
              <Label htmlFor="currency">Currency *</Label>
              <Select
                options={[
                  { value: "NGN", label: "NGN - Nigerian Naira" },
                  { value: "USD", label: "USD - US Dollar" },
                  { value: "EUR", label: "EUR - Euro" },
                  { value: "GBP", label: "GBP - British Pound" },
                ]}
                value={{ value: formData.currency, label: formData.currency }}
                onChange={(opt) => handleInputChange("currency", opt?.value ?? "NGN")}
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
                onChange={(e) => handleInputChange("exRate", Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="footer-actions">
          <Button onClick={handleCancel} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading.createPolicy}>
            {loading.createPolicy ? "Creating..." : "Create Policy"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreatePolicy
