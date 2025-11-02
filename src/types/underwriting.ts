// Underwriting System Types - Mirror of Quotation types but for policy underwriting

export interface SelectOption {
  value: string
  label: string
}

export interface MarketingStaff {
  id: string
  name: string
  email: string
}

export interface Policy {
  policyNo: string
  policyDate: string
  companyID: string
  branchID: string
  branch: string
  product: string
  productID: string
  bizSource: string
  businessType: string
  accountType: string
  subRiskID: string
  subRisk: string
  partyID: string
  party: string
  mktStaffID: string
  mktStaff: string
  insuredID: string | null
  insSurname: string
  insFirstname: string
  insOthernames: string
  insAddress: string
  insOccupation: string
  insStateID: string | null
  insMobilePhone: string
  insEmail: string
  riskLocation: string
  riskClassification: string
  entryDate: string
  effectiveDate: string
  expiryDate: string
  exRate: number
  exCurrency: string
  proportionShare: number
  ourShare: number
  policyExcess: number
  status: string
  remarks: string | null
  deleted: number
  active: number
  createdBy: string
  createdOn: string
  modifiedBy: string | null
  modifiedOn: string | null
  isProposal: number
}

export interface CreatePolicyRequest {
  product: string
  productID: string
  branchID: string
  insuredName?: string
  insuredID?: string
  partyID: string
  mktStaffID: string
  entryDate: string
  effectiveDate: string
  expiryDate: string
  businessType: string
  accountType: string
  bizSource: string
  insAddress: string
  insMobilePhone: string
  insEmail: string
  insOccupation: string
  riskLocation: string
  riskClassification: string
  currency: string
  exRate: number
  proportionShare: number
  ourShare: number
  remarks?: string
  companyID: string
  surname?: string
  firstName?: string
  otherNames?: string
  isOrg: boolean
}

export interface UpdatePolicyRequest {
  surname?: string
  firstName?: string
  insAddress: string
  insMobilePhone: string
  insEmail: string
  insOccupation: string
  riskLocation: string
  riskClassification: string
  businessType: string
  accountType: string
  bizSource: string
  proportionShare: number
  ourShare: number
  policyExcess: number
  remarks: string
  modifiedBy: string
}

export interface PolicySection {
  sectionID: string
  sectionName: string
  policyNo: string
  entryDate: string
  startDate: string
  expiryDate: string
  coverDays: number
  riskItems: PolicyRiskItem[]
}

export interface PolicyRiskItem {
  itemNo: number
  sectionID: string
  smiCode: string
  itemDescription: string
  sumInsured: number
  itemRate: number
  multiplier: number
  location: string
  premium: number
  ourShareSumInsured: number
  ourSharePremium: number
}

export interface PolicyCalculation {
  policyNo: string
  totalSumInsured: number
  totalPremium: number
  netPremium: number
  shareSumInsured: number
  sharePremium: number
  currencyType: string
  sumInsuredLC: number
  exchangeRate: number
  premiumLC: number
  discounts: {
    theftLoading: number
    srccLoading: number
    otherLoading: number
    specialDiscount: number
    deductibleDiscount: number
    spreadDiscount: number
    ltaDiscount: number
  }
  netPremiumDue: number
  proRataPremium: number
  coverDays: number
}

export interface PolicyPaginationResponse {
  items: Policy[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface UnderwritingState {
  policies: Policy[]
  currentPolicy: Policy | null
  currentCalculation: PolicyCalculation | null
  sections: PolicySection[]
  selectedRiskFilter: string | null
  marketingStaffs: MarketingStaff[]
  products: SelectOption[]
  branches: SelectOption[]
  agents: SelectOption[]
  businessSource: SelectOption[]
  businessType: SelectOption[]
  accountType: SelectOption[]
  busChannels: SelectOption[]
  subChannels: SelectOption[]
  currency: SelectOption[]
  occupations: SelectOption[]
  riskClassifications: SelectOption[]
  sectionsList: SelectOption[]
  riskSMI: SelectOption[]
  loading: {
    fetchPolicies: boolean
    createPolicy: boolean
    updatePolicy: boolean
    deletePolicy: boolean
    calculate: boolean
  }
  success: {
    createPolicy: boolean
    updatePolicy: boolean
    deletePolicy: boolean
    calculate: boolean
  }
  error: {
    fetchPolicies: string | null
    createPolicy: string | null
    updatePolicy: string | null
    deletePolicy: string | null
    calculate: string | null
  }
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
  searchTerm: string
  activeTab: "active" | "drafts" | "pending" | "approved"
}
