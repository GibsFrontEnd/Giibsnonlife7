// Motor-specific types for the quotation system

export interface MotorAdjustment {
  adjustmentName: string
  adjustmentType: string
  rate: number
  appliedOn: "SumInsured" | "Premium"
  baseAmount: number
  amount: number
  sequenceOrder: number
  formula: string
}

export interface MotorVehicle {
  itemNo: number
  vehicleRegNo: string
  vehicleUser: string
  vehicleType: string
  vehicleMake: string
  vehicleModel: string
  chassisNo: string
  engineNo: string
  color: string
  modelYear: number
  coverType: string
  usage: string
  vehicleValue: number
  premiumRate: number
  state: string
  seatCapacity: number
  waxCode: string
  location: string
  startDate: string
  endDate: string
  trackingCost: number
  rescueCost: number
  discounts: MotorAdjustment[]
  loadings: MotorAdjustment[]
}

export interface CalculatedMotorVehicle extends MotorVehicle {
  basicPremium: number
  premiumAfterDiscounts: number
  grossPremium: number
  netPremium: number
  totalDiscountAmount: number
  totalLoadingAmount: number
  step1_BasicPremium?: {
    stepName: string
    startingAmount: number
    adjustments: any[]
    finalAmount: number
    formula: string
  }
  step2_Discounts?: {
    stepName: string
    startingAmount: number
    adjustments: MotorAdjustment[]
    finalAmount: number
    totalDiscountAmount: number
  }
  step3_Loadings?: {
    stepName: string
    startingAmount: number
    adjustments: MotorAdjustment[]
    finalAmount: number
    totalLoadingAmount: number
  }
  step4_FinalPremium?: {
    stepName: string
    grossPremium: number
    trackingCost: number
    rescueCost: number
    netPremium: number
  }
}

export interface MotorVehicleUI extends MotorVehicle {
  _collapsed?: boolean
  _showDetails?: boolean
  uiId?: string
}

export interface MotorCalculationRequest {
  proposalNo: string
  vehicles: MotorVehicle[]
  otherDiscountRate: number
  otherLoadingRate: number
  proportionRate: number
  exchangeRate: number
  currency: string
  coverDays: number
  calculatedBy: string
}

export interface MotorCalculationResponse {
  proposalNo: string
  calculatedVehicles: CalculatedMotorVehicle[]
  totalVehicleValue: number
  totalNetPremium: number
  vehicleCount: number
  otherDiscountRate: number
  otherLoadingRate: number
  otherDiscountAmount: number
  otherLoadingAmount: number
  netPremiumDue: number
  proRataPremium: number
  shareSumInsured: number
  sharePremium: number
  foreignSumInsured: number
  foreignPremium: number
  finalPremiumDue: number
  success: boolean
  message: string
}

export interface MotorCalculationBreakdown {
  proposalNo: string
  calculatedOn: string
  calculatedBy: string
  inputs: {
    proportionRate: number
    exchangeRate: number
    currency: string
    coverDays: number
    vehicleCount: number
    otherDiscountRate: number
    otherLoadingRate: number
  }
  vehicleCalculations: CalculatedMotorVehicle[]
  proposalAdjustments: {
    aggregatePremium: number
    otherDiscountRate: number
    otherDiscountAmount: number
    premiumAfterDiscount: number
    otherLoadingRate: number
    otherLoadingAmount: number
    netPremiumDue: number
  }
  finalCalculation: {
    netPremium: number
    totalVehicleValue: number
    coverDays: number
    proRataPremium: number
    proportionRate: number
    shareSumInsured: number
    sharePremium: number
    foreignSumInsured: number
    foreignPremium: number
    finalPremiumDue: number
  }
  success: boolean
  message: string
}

export interface MotorQuotationState {
  currentProposal: any | null
  currentCalculation: MotorCalculationResponse | null
  calculationBreakdown: MotorCalculationBreakdown | null
  vehicles: MotorVehicleUI[]

  loading: {
    fetchProposal: boolean
    calculate: boolean
    fetchCalculation: boolean
  }
  success: {
    calculate: boolean
  }
  error: {
    fetchProposal: string | null
    calculate: string | null
    fetchCalculation: string | null
  }
}
