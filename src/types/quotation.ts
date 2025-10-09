// New types based on actual API structure
export interface Proposal {
  proposalNo: string
  transDate: string
  coPolicyNo: string | null
  companyID: string
  branchID: string
  branch: string
  bizSource: string
  subRiskID: string
  subRisk: string
  riskID:string
  partyID: string
  party: string
  mktStaffID: string
  mktStaff: string
  insuredID: string | null
  insSurname: string
  insFirstname: string
  insOthernames: string
  insAddress: string
  insStateID: string | null
  insMobilePhone: string
  insLandPhone: string | null
  insEmail: string
  insFaxNo: string | null
  insOccupation: string
  isProposal: number
  startDate: string
  endDate: string
  exRate: number
  exCurrency: string
  premiumRate: number | null
  proportionRate: number
  sumInsured: number | null
  grossPremium: number | null
  sumInsuredFrgn: number | null
  grossPremiumFrgn: number | null
  proRataDays: number | null
  proRataPremium: number | null
  remarks: string | null
  deleted: number
  active: number
  undEmail1: string | null
  undEmail2: string | null
  transSTATUS: string
  submittedBy: string
  submittedOn: string
  modifiedBy: string | null
  modifiedOn: string | null
  leaderID: string | null
  leader: string | null
  commissionRate: number | null
}

export interface CreateProposalRequest {
  subriskID: string
  branchID: string
  insuredID: string
  partyID: string
  mktStaffID: string
  startDate: string
  endDate: string
  insAddress: string
  insMobilePhone: string
  insEmail: string
  insOccupation: string
  bizSource: string
  proportionRate: number
  currency: string
  exRate: number
  surname: string;
  firstName: string;
  otherNames: string;
  isOrg: boolean;
}

export interface UpdateProposalRequest {
  insuredName: string
  insAddress: string
  insMobilePhone: string
  insEmail: string
  insOccupation: string
  bizSource: string
  proportionRate: number
  remarks: string
  modifiedBy: string
}

export interface StockItem {
  stockCode: string
  stockDescription: string
  stockSumInsured: number
  stockRate: number
  stockDiscountRate: number
}

export interface RiskItem {
  itemNo: number
  sectionID: string
  smiCode: string
  itemDescription: string
  actualValue: number
  itemRate: number
  multiplyRate: number
  location: string
  stockItem?: StockItem
  feaDiscountRate: number
}

export interface CalculatedAggregate{
    aggregateSumInsured: number,
    aggregatePremium: number,
    success: boolean,
    message: string
  
}

export interface sectionAdjustments extends Omit<ProposalAdjustments, 'otherLoadingsRate'>{
  aggregatePremium: number,
}

export interface CalculatedRiskItem extends RiskItem {
  actualPremium: number
  shareValue: number
  premiumValue: number
  stockSumInsured: number
  stockGrossPremium: number
  stockDiscountAmount: number
  stockNetPremium: number
  totalSumInsured: number
  totalGrossPremium: number
  feaDiscountAmount: number
  netPremiumAfterDiscounts: number
  actualPremiumFormula: string
  shareValueFormula: string
  premiumValueFormula: string
}
export type RiskItemUI = RiskItem &
  Partial<
    Pick<
      CalculatedRiskItem,
      | "actualPremium"
      | "shareValue"
      | "premiumValue"
      | "stockSumInsured"
      | "stockGrossPremium"
      | "stockDiscountAmount"
      | "stockNetPremium"
      | "totalSumInsured"
      | "totalGrossPremium"
      | "feaDiscountAmount"
      | "netPremiumAfterDiscounts"
      | "actualPremiumFormula"
      | "shareValueFormula"
      | "premiumValueFormula"
    >
  > & {
    // UI-only flags (optional)
    _showStock?: boolean
    _collapsed?: boolean
    // optional client-side id (if you need something stable for matching)
    uiId?: string
  }
  
export interface QuoteSection {
  sectionID: string
  sectionName: string
  location: string
  sectionSumInsured: number
  sectionPremium: number
  sectionGrossPremium: number
  sectionNetPremium: number
  riskItems: RiskItemUI[]
}

export interface aggregateTotals{
  sectionSummaries: [
    {
      sectionID: string,
      sectionName: string,
      sectionSumInsured: number,
      sectionAggregatePremium: number,
      riskItemCount: number
    }
  ],
  totalSumInsured: number,
  totalAggregatePremium: number,
  sectionCount: number,
  success: boolean,
  message: string
}

export interface CalculatedSection {
  sectionID: string
  sectionName: string
  calculatedItems: CalculatedRiskItem[]
  sectionSumInsured: number
  sectionGrossPremium: number
  sectionNetPremium: number
  sectionAdjustments?: SectionAdjustments
}

export interface SectionAdjustments {
  startingPremium: number
  discountsApplied: any[]
  loadingsApplied: any[]
  finalNetPremium: number
  totalDiscountAmount: number
  totalLoadingAmount: number
  netAdjustmentAmount: number
}

export interface ProposalAdjustments {
  specialDiscountRate: number
  deductibleDiscountRate: number
  spreadDiscountRate: number
  ltaDiscountRate: number
  otherDiscountsRate: number
  theftLoadingRate: number
  srccLoadingRate: number
  otherLoading2Rate: number
  otherLoadingsRate: number
}

export interface AdjustmentCalculations {
  startingPremium: number
  specialDiscountAmount: number
  specialDiscountNetAmount: number
  deductibleDiscountAmount: number
  deductibleDiscountNetAmount: number
  spreadDiscountAmount: number
  spreadDiscountNetAmount: number
  ltaDiscountAmount: number
  ltaDiscountNetAmount: number
  theftLoadingAmount: number
  theftLoadingNetAmount: number
  srccLoadingAmount: number
  srccLoadingNetAmount: number
  otherLoading2Amount: number
  otherLoading2NetAmount: number
  netPremiumDue: number
  success: boolean
  message: string | null
}

export interface ProRataCalculations {
  netPremiumDue: number
  proRataPremium: number
  premiumDue: number
  coverDays: number
  isProRated: boolean
  success: boolean
  message: string | null
}

export interface CompleteCalculationRequest {
  proposalNo: string
  sections: QuoteSection[]
  proportionRate: number
  exchangeRate: number
  currency: string
  coverDays: number
  specialDiscountRate: number
  deductibleDiscountRate: number
  spreadDiscountRate: number
  ltaDiscountRate: number
  otherDiscountsRate: number
  theftLoadingRate: number
  srccLoadingRate: number
  otherLoading2Rate: number
  otherLoadingsRate: number
  calculatedBy: string
  remarks: string
}

export interface CompleteCalculationResponse {
  specialDiscountRate: number
  deductibleDiscountRate: number
  spreadDiscountRate: number
  ltaDiscountRate: number
  otherDiscountsRate: number
  theftLoadingRate: number
  srccLoadingRate: number
  otherLoading2Rate: number
  otherLoadingsRate: number
  remarks: any
  proposalNo: string
  subrisk: string | null
  policyDetailId: string | null
  sectionCalculations: CalculatedSection[]
  totalSumInsured: number
  totalPremium: number
  netPremium: number
  proRataPremium: number
  shareSumInsured: number
  sharePremium: number
  foreignSumInsured: number
  foreignPremium: number
  adjustmentCalculations: AdjustmentCalculations
  proRataCalculations: ProRataCalculations
  success: boolean
  message: string | null
  validationErrors: string[]
  calculatedOn: string
}

export interface CalculationBreakdown {
  proposalNo: string
  calculatedOn: string
  calculatedBy: string
  calculationType: string
  remarks: string
  inputs: any
  calculationSteps: any
  finalResults: {
    totalSumInsured: number
    totalPremium: number
    netPremium: number
    proRataPremium: number
    shareSumInsured: number
    sharePremium: number
    foreignSumInsured: number
    foreignPremium: number
    foreignCurrency: string
    overallPremiumRate: number
    effectiveDiscountRate: number
    effectiveLoadingRate: number
    grossPremiumRate: number
    netPremiumRate: number
    proportionShare: number
  }
}

export interface ProposalPaginationResponse {
  items: Proposal[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface SectionsSummary {
  proposalNo: string
  sections: Array<{
    sectionID: string
    sectionName: string
    sectionSumInsured: number
    sectionPremium: number
    netPremium: number
    lastCalculated: string
  }>
}

// --- types/quotation.ts (append or merge into existing file) ---

// Response for /api/Quotation/calculate/risk-items
export interface CalculateRiskItemsResponse {
  subrisk: string
  calculatedItems: CalculatedRiskItem[]
  totalActualValue?: number
  totalActualPremium?: number
  totalShareValue?: number
  totalSharePremium?: number
  totalNetPremiumAfterDiscounts?: number
  success: boolean
  message?: string | null
}

// Update QuotationState to include calculateRiskItems flags in loading/success/error
export interface QuotationState {
  proposals: Proposal[]
  currentProposal: Proposal | null
  currentCalculation: CompleteCalculationResponse | null
  calculationBreakdown: CalculationBreakdown | null
  sectionsSummary: SectionsSummary | null
  sections: QuoteSection[]
  selectedRiskFilter: string | null
  loading: {
    fetchProposals: boolean
    createProposal: boolean
    updateProposal: boolean
    deleteProposal: boolean
    calculate: boolean
    fetchCalculation: boolean
    calculateRiskItems: boolean   // << added
  }
  success: {
    createProposal: boolean
    updateProposal: boolean
    deleteProposal: boolean
    calculate: boolean
    calculateRiskItems: boolean  // << added
  }
  error: {
    fetchProposals: string | null
    createProposal: string | null
    updateProposal: string | null
    deleteProposal: string | null
    calculate: string | null
    fetchCalculation: string | null
    calculateRiskItems: string | null // << added
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
  activeTab: "overview" | "drafts" | "calculated" | "converted"
}
