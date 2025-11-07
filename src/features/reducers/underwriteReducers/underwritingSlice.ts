import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type {
  UnderwritingState,
  Policy,
  CreatePolicyRequest,
  UpdatePolicyRequest,
  PolicyCalculation,
  PolicyPaginationResponse,
  PolicySection,
} from "../../../types/underwriting"

const API_BASE_URL = "https://core-api.newgibsonline.com/api"
const AUTH_TOKEN =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoicGVsbHVtaSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWVpZGVudGlmaWVyIjoiNjM0IiwiZXhwIjoxNzU5MjU1NTQyfQ.0YJXJHzIrIkQDUDCAxLGG4ZAi9XsVrZIUQvjuzpEyy4"

// Fetch policies with pagination and filtering
export const fetchPolicies = createAsyncThunk(
  "underwriting/fetchPolicies",
  async (
    {
      page = 1,
      pageSize = 50,
      sortBy = "PolicyDate",
      sortDirection = "DESC",
      riskClass = "",
    }: {
      page?: number
      pageSize?: number
      sortBy?: string
      sortDirection?: string
      riskClass?: string
    },
    { rejectWithValue },
  ) => {
    try {
      let url = `${API_BASE_URL}/Policy?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&sortDirection=${sortDirection}`
      if (riskClass) {
        url += `&riskClass=${riskClass}`
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "text/plain",
          Authorization: AUTH_TOKEN,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data as PolicyPaginationResponse
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch policies")
    }
  },
)

// Get policy by policy number
export const getPolicyByNumber = createAsyncThunk(
  "underwriting/getPolicyByNumber",
  async (policyNo: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Policy/${policyNo}?policyNo=${policyNo}`, {
        method: "GET",
        headers: {
          accept: "text/plain",
          Authorization: AUTH_TOKEN,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data as Policy
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch policy")
    }
  },
)

// Create new policy
export const createPolicy = createAsyncThunk(
  "underwriting/createPolicy",
  async (policyData: CreatePolicyRequest, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Policy`, {
        method: "POST",
        headers: {
          accept: "text/plain",
          Authorization: AUTH_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(policyData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data as Policy
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to create policy")
    }
  },
)

// Update policy
export const updatePolicy = createAsyncThunk(
  "underwriting/updatePolicy",
  async ({ policyNo, policyData }: { policyNo: string; policyData: UpdatePolicyRequest }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Policy/${policyNo}?policyNo=${policyNo}`, {
        method: "PUT",
        headers: {
          accept: "text/plain",
          Authorization: AUTH_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(policyData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data as Policy
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to update policy")
    }
  },
)

// Delete policy
export const deletePolicy = createAsyncThunk(
  "underwriting/deletePolicy",
  async (policyNo: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Policy/${policyNo}?policyNo=${policyNo}`, {
        method: "DELETE",
        headers: {
          accept: "text/plain",
          Authorization: AUTH_TOKEN,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return policyNo
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to delete policy")
    }
  },
)

// Calculate policy premium
export const calculatePolicyPremium = createAsyncThunk(
  "underwriting/calculatePolicyPremium",
  async ({ policyNo, calculationData }: { policyNo: string; calculationData: any }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Policy/${policyNo}/calculate/premium`, {
        method: "POST",
        headers: {
          accept: "text/plain",
          Authorization: AUTH_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calculationData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data as PolicyCalculation
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to calculate premium")
    }
  },
)

const DUMMY_PRODUCTS = [
  { value: "1", label: "STANDARD FIRE POLICY" },
  { value: "2", label: "PRIVATE DWELLING FIRE & SPECIAL PERILS" },
  { value: "3", label: "PRIVATE DWELLING HOUSE HOLDERS/OWNER BETTER HOME GUARD" },
  { value: "4", label: "BUSINESS FIRE & SPECIAL PERILS" },
  { value: "5", label: "BUSINESS FIRE & SPECIAL PERILS - DECLARATION POLICY" },
  { value: "6", label: "FIRE CONSEQUENTIAL LOSS" },
  { value: "7", label: "COMBINED FIRE & BURGLARY" },
  { value: "8", label: "TERRORISM & POLITICAL RISKS" },
]

const DUMMY_BRANCHES = [
  { value: "ABA", label: "ABA" },
  { value: "ABEOKUTA", label: "ABEOKUTA (Sales outlet)" },
  { value: "ABUJA", label: "ABUJA" },
  { value: "ABUJA_REGION", label: "ABUJA REGION 1" },
  { value: "AJAH", label: "AJAH" },
  { value: "AKURE", label: "AKURE SALES OUTLET" },
  { value: "ALABA", label: "ALABA (SALES OUTLET)" },
  { value: "ALTERNATIVE", label: "ALTERNATIVE CHANNEL" },
  { value: "APAPA", label: "APAPA" },
  { value: "BANCASSURANCE", label: "BANCASSURANCE" },
  { value: "CALABAR", label: "CALABAR" },
  { value: "EBUSINESS", label: "E BUSINESS" },
  { value: "ENUGU", label: "ENUGU (Sales Outlet)" },
  { value: "EPE", label: "EPE" },
  { value: "FESTAC", label: "FESTAC (Sales Outlet)" },
  { value: "HEAD_OFFICE", label: "HEAD OFFICE" },
  { value: "IBADAN", label: "IBADAN" },
  { value: "IKEJA", label: "IKEJA" },
  { value: "IKORODU", label: "IKORODU" },
  { value: "IKOTA", label: "IKOTA (Sales Outlet)" },
  { value: "ILORIN", label: "ILORIN (Sales Outlet)" },
  { value: "IMPLANT", label: "IMPLANT" },
  { value: "IMPLANT3", label: "IMPLANT 3" },
  { value: "JOS", label: "JOS" },
  { value: "KANO", label: "KANO" },
  { value: "LAGOS_ISLAND", label: "LAGOS ISLAND" },
  { value: "LEKKI", label: "LEKKI" },
  { value: "ONITSHA", label: "ONITSHA (Sales Outlet)" },
  { value: "OSHOGBO", label: "OSHOGBO" },
  { value: "OWERRI", label: "OWERRI (Sales Outlet)" },
  { value: "PORTHARCOURT", label: "PORTHARCOURT" },
  { value: "REINSURANCE", label: "RE-INSURANCE" },
  { value: "REGION3", label: "REGION 3" },
  { value: "SME", label: "SME" },
  { value: "SOKOTO", label: "SOKOTO" },
  { value: "SPECIAL_RISK", label: "SPECIAL RISK" },
  { value: "SURULERE", label: "SURULERE" },
  { value: "UMUAHIA", label: "UMUAHIA" },
  { value: "UYO", label: "UYO" },
  { value: "VICTORIA", label: "VICTORIA ISLAND" },
  { value: "WARRI", label: "WARRI" },
  { value: "YABA", label: "YABA" },
  { value: "YENOGOA", label: "YENOGOA" },
]

const DUMMY_AGENTS = [
  { value: "1", label: "Direct Sales Team" },
  { value: "2", label: "Premium Brokers Ltd" },
  { value: "3", label: "Insurance Partners Inc" },
  { value: "4", label: "Allied Insurance Agents" },
  { value: "5", label: "Market Leaders Group" },
]

const DUMMY_BUSINESS_SOURCE = [
  { value: "DIRECT", label: "DIRECT" },
  { value: "DIRECT_COMMISSION", label: "DIRECT With COMMISSION" },
  { value: "AGENTS", label: "AGENTS" },
  { value: "BROKERS", label: "BROKERS" },
  { value: "INSURANCE_COMPANIES", label: "INSURANCE COMPANIES" },
  { value: "REINSURANCE_COMPANIES", label: "REINSURANCE COMPANIES" },
  { value: "BANC_ASSURANCE", label: "BANC ASSURANCE" },
  { value: "AGENT_COMMISSION", label: "AGENT COMMISSION" },
  { value: "ALTERNATE_DISTRIBUTION", label: "ALTERNATE DISTRIBUTION" },
  { value: "ECHANNEL", label: "E-CHANNEL" },
  { value: "ECHANNEL_COMMISSION", label: "E-CHANNEL With COMMISSION" },
]

const DUMMY_BUSINESS_TYPE = [
  { value: "DIRECT_NO_COIN", label: "DIRECT With OUT COINSURANCE" },
  { value: "DIRECT_COIN", label: "DIRECT With COINSURANCE" },
  { value: "INWARD_COIN", label: "INWARD COINSURANCE" },
  { value: "FACULTATIVE", label: "FACULTATIVE INWARD" },
]

const DUMMY_ACCOUNT_TYPE = [
  { value: "100_PERCENT", label: "100% Accounting" },
  { value: "OUR_SHARE", label: "Our Share Accounting" },
]

const DUMMY_BUS_CHANNELS = [
  { value: "ABEOKUTA", label: "ABEOKUTA" },
  { value: "LAGOS", label: "LAGOS" },
  { value: "ABUJA", label: "ABUJA" },
  { value: "IBADAN", label: "IBADAN" },
]

const DUMMY_SUB_CHANNELS = [
  { value: "FP_ABEOKUTA", label: "FP-ABEOKUTA" },
  { value: "INTRODUCTORY", label: "INTRODUCTORY" },
  { value: "AGENTS", label: "AGENTS" },
  { value: "BROKERS", label: "BROKERS" },
  { value: "STAFF", label: "STAFF" },
]

const DUMMY_CURRENCY = [
  { value: "NAIRA", label: "NAIRA" },
  { value: "YEN", label: "YEN" },
  { value: "DOLLAR", label: "DOLLAR" },
  { value: "EURO", label: "EURO" },
  { value: "POUND", label: "POUND" },
  { value: "FRANC", label: "FRANC" },
]

const DUMMY_OCCUPATIONS = [
  { value: "SCHOOLS", label: "Schools" },
  { value: "HOSPITALS", label: "Hospitals" },
  { value: "PLACES_OF_WORSHIP", label: "Places of Worship-Churches, Mosques, Temples, Chapels" },
  { value: "RESIDENTIAL", label: "Residential buildings" },
  { value: "OFFICE", label: "Office buildings" },
  { value: "DESALINATION", label: "Desalination Plants" },
  { value: "WATER_PROCESSING", label: "Water processing plants" },
  { value: "PUBLIC_BUILDINGS", label: "Public Buildings" },
  { value: "AUDITORIUMS", label: "Auditoriums" },
  { value: "BANKS", label: "Banks" },
  { value: "GYMNASIUMS", label: "Gymnasiums" },
  { value: "MUSEUMS", label: "Museums and Theatres" },
  { value: "NURSING_HOMES", label: "Nursing Homes" },
  { value: "BROADCASTING", label: "Broadcasting Stations" },
  { value: "CINEMA", label: "Cinema Theatres" },
  { value: "EDUCATIONAL", label: "Educational Institutions" },
  { value: "SALT_WORKS", label: "Salt works and refineries" },
  { value: "CEMENT_PLANTS", label: "Cement plants and stone crushing activities" },
  { value: "FLOUR_MILLS", label: "Flour and meal mills" },
  { value: "HOTELS", label: "Hotels/Casinos/Restaurants/Bars/School Kitchens/Hostel/where cooking is done" },
  { value: "VIDEO_STUDIOS", label: "Video & Sound recording rooms/studios" },
  { value: "RETAIL_GOODS", label: "Sale of goods (excluding showrooms and stores, malls, supermarkets)" },
  { value: "ELECTRICAL", label: "Electrical and electronics industry" },
  { value: "RADIO_TV", label: "Radio and TV Broadcasting Stations" },
  { value: "FOOD_PROCESSING", label: "Food Processing plants and bakeries" },
  { value: "BEVERAGE", label: "Beverage manufacturing" },
  { value: "LEATHER_TANNERY", label: "Leather tannery industries/Shoe manufacturing" },
  { value: "UNOCCUPIED", label: "Unoccupied Buildings/Buildings under construction" },
  { value: "AIRPORT", label: "Airport Terminals" },
  { value: "VEHICLE_GARAGES", label: "Vehicle Garages and showrooms" },
]

const DUMMY_RISK_CLASSIFICATIONS = [
  { value: "SERVICES", label: "Services, such as schools, hospitals etc." },
  { value: "RESIDENTIAL", label: "Residential and office buildings" },
  { value: "CEMENT_PLANTS", label: "Cement plants and stone crushing activities" },
  { value: "SALT_WORKS", label: "Salt works and Refineries" },
  { value: "DESALINATION", label: "Desalination plants" },
  { value: "BEVERAGE", label: "Beverage manufacturing and bottling" },
  { value: "HOTELS", label: "Hotels" },
  { value: "SALE_OF_GOODS", label: "Sale of goods (including showrooms and department stores)" },
  { value: "ROLLING_MILLS", label: "Rolling mills, metallurgical plants" },
  { value: "ELECTRICAL", label: "Electrical Industry" },
  { value: "CHEMICAL_PLANTS", label: "Chemical plants (except petrochemical industry)" },
  { value: "FOOD", label: "Food" },
  { value: "POWER", label: "Power plants" },
  { value: "RUBBER", label: "Rubber" },
  { value: "OIL_MILLS", label: "Oil mills for cotton seeds" },
  { value: "FOAM_PLASTICS", label: "Foam, plastics" },
  { value: "EXPLOSIVES", label: "Explosives, matches" },
  { value: "PAPER_LEATHER", label: "Paper, leather" },
  { value: "WOOD_PROCESSING", label: "Wood processing, chipboard manufacturing" },
  { value: "GRAIN_SILOS", label: "Grain silos, mills, fodder factories" },
  { value: "WAREHOUSES", label: "Warehouses, open air storage" },
  { value: "COLD_STORES", label: "Cold stores" },
  { value: "TEXTILES", label: "Textiles" },
  { value: "COTTON_RISKS", label: "Cotton risks" },
  { value: "ANIMAL_FEED", label: "Animal Feed" },
]

const DUMMY_SECTIONS = [
  { value: "BUILDING", label: "BUILDING" },
  { value: "ELECTRICAL", label: "ELECTRICAL INSTALLATIONS" },
  { value: "FURNITURE", label: "FURNITURE, FIXTURES & FITTINGS" },
  { value: "LOSS_RENT", label: "LOSS OF RENT" },
  { value: "PERSONAL", label: "PERSONAL EFFECTS" },
  { value: "OTHER_CONTENTS", label: "OTHER CONTENTS" },
]

const DUMMY_RISK_SMI = [
  { value: "SMI001", label: "Building Structure" },
  { value: "SMI002", label: "Electrical System" },
  { value: "SMI003", label: "Furniture & Fixtures" },
  { value: "SMI004", label: "Contents" },
  { value: "SMI005", label: "Loss of Rent" },
]

const DUMMY_MARKETING_STAFFS = [
  { id: "1", name: "John Smith", email: "john.smith@company.com" },
  { id: "2", name: "Sarah Johnson", email: "sarah.johnson@company.com" },
  { id: "3", name: "Michael Brown", email: "michael.brown@company.com" },
  { id: "4", name: "Emily Davis", email: "emily.davis@company.com" },
]

const DUMMY_CALCULATIONS = [
  {
    id: "CALC001",
    calculationName: "Initial Calculation",
    policyNo: "P100A20102016A00001",
    totalSumInsured: 50000000,
    totalPremium: 750000,
    netPremium: 675000,
    shareSumInsured: 50000000,
    sharePremium: 750000,
    currencyType: "NAIRA",
    sumInsuredLC: 50000000,
    exchangeRate: 1,
    premiumLC: 750000,
    discounts: {
      theftLoading: 5,
      srccLoading: 0,
      otherLoading: 2,
      specialDiscount: 10,
      deductibleDiscount: 0,
      spreadDiscount: 5,
      ltaDiscount: 3,
    },
    netPremiumDue: 675000,
    proRataPremium: 56250,
    coverDays: 365,
    createdBy: "John Smith",
    createdOn: new Date("2024-01-15").toISOString(),
  },
  {
    id: "CALC002",
    calculationName: "Revised Calculation - Updated Coverage",
    policyNo: "P100A20102016A00001",
    totalSumInsured: 75000000,
    totalPremium: 1125000,
    netPremium: 1012500,
    shareSumInsured: 75000000,
    sharePremium: 1125000,
    currencyType: "NAIRA",
    sumInsuredLC: 75000000,
    exchangeRate: 1,
    premiumLC: 1125000,
    discounts: {
      theftLoading: 3,
      srccLoading: 2,
      otherLoading: 0,
      specialDiscount: 8,
      deductibleDiscount: 2,
      spreadDiscount: 3,
      ltaDiscount: 2,
    },
    netPremiumDue: 1012500,
    proRataPremium: 84375,
    coverDays: 365,
    createdBy: "Sarah Johnson",
    createdOn: new Date("2024-01-20").toISOString(),
  },
  {
    id: "CALC003",
    calculationName: "Initial Calculation",
    policyNo: "P-100-2010-2016-00002",
    totalSumInsured: 30000000,
    totalPremium: 450000,
    netPremium: 405000,
    shareSumInsured: 22500000,
    sharePremium: 337500,
    currencyType: "NAIRA",
    sumInsuredLC: 30000000,
    exchangeRate: 1,
    premiumLC: 450000,
    discounts: {
      theftLoading: 0,
      srccLoading: 0,
      otherLoading: 0,
      specialDiscount: 0,
      deductibleDiscount: 0,
      spreadDiscount: 0,
      ltaDiscount: 0,
    },
    netPremiumDue: 337500,
    proRataPremium: 67500,
    coverDays: 365,
    createdBy: "Michael Brown",
    createdOn: new Date("2024-02-01").toISOString(),
  },
  {
    id: "CALC004",
    calculationName: "Initial Calculation",
    policyNo: "P-100-2010-2016-00003",
    totalSumInsured: 100000000,
    totalPremium: 1500000,
    netPremium: 1350000,
    shareSumInsured: 50000000,
    sharePremium: 750000,
    currencyType: "NAIRA",
    sumInsuredLC: 100000000,
    exchangeRate: 1,
    premiumLC: 1500000,
    discounts: {
      theftLoading: 8,
      srccLoading: 3,
      otherLoading: 0,
      specialDiscount: 5,
      deductibleDiscount: 3,
      spreadDiscount: 1,
      ltaDiscount: 0,
    },
    netPremiumDue: 750000,
    proRataPremium: 138600,
    coverDays: 365,
    createdBy: "Emily Davis",
    createdOn: new Date("2023-12-01").toISOString(),
  },
]

export const DUMMY_POLICIES: Policy[] = [
  {
    policyNo: "P100A20102016A00001",
    policyDate: "2024-01-10",
    companyID: "COMP001",
    branchID: "BR001",
    branch: "IKEJA",
    product: "STANDARD FIRE POLICY",
    productID: "PROD001",
    bizSource: "DIRECT",
    businessType: "DIRECT WITHOUT COINSURANCE",
    accountType: "100% Accounting",
    subRiskID: "SUB001",
    subRisk: "Residential Building",
    partyID: "PTY001",
    party: "Adeyemi John",
    mktStaffID: "MKT001",
    mktStaff: "John Smith",
    insuredID: "INS001",
    insSurname: "Adeyemi",
    insFirstname: "John",
    insOthernames: "",
    insAddress: "123 Lagos Street, Lagos",
    insOccupation: "OFFICE",
    insStateID: "LAGOS",
    insMobilePhone: "08012345678",
    insEmail: "john.adeyemi@example.com",
    riskLocation: "Lagos Island",
    riskClassification: "RESIDENTIAL",
    entryDate: "2024-01-10",
    effectiveDate: "2024-01-15",
    expiryDate: "2025-01-15",
    exRate: 1,
    exCurrency: "NAIRA",
    proportionShare: 100,
    ourShare: 100,
    policyExcess: 0,
    status: "ACTIVE",
    remarks: null,
    deleted: 0,
    active: 1,
    createdBy: "system",
    createdOn: "2024-01-10",
    modifiedBy: null,
    modifiedOn: null,
    isProposal: 0,
  },
  {
    policyNo: "P100A20102016A00002",
    policyDate: "2024-01-28",
    companyID: "COMP001",
    branchID: "BR002",
    branch: "ABUJA",
    product: "PRIVATE DWELLING FIRE & SPECIAL PERILS",
    productID: "PROD002",
    bizSource: "AGENTS",
    businessType: "DIRECT WITH COINSURANCE",
    accountType: "Our Share Accounting",
    subRiskID: "SUB002",
    subRisk: "Residential Property",
    partyID: "PTY002",
    party: "Mary Okonkwo",
    mktStaffID: "MKT002",
    mktStaff: "Sarah Johnson",
    insuredID: "INS002",
    insSurname: "Okonkwo",
    insFirstname: "Mary",
    insOthernames: "",
    insAddress: "456 Abuja Road, Abuja",
    insOccupation: "RESIDENTIAL",
    insStateID: "ABUJA",
    insMobilePhone: "08023456789",
    insEmail: "mary.okonkwo@example.com",
    riskLocation: "Abuja Central",
    riskClassification: "RESIDENTIAL",
    entryDate: "2024-01-28",
    effectiveDate: "2024-02-01",
    expiryDate: "2025-02-01",
    exRate: 1,
    exCurrency: "NAIRA",
    proportionShare: 75,
    ourShare: 75,
    policyExcess: 0,
    status: "DRAFT",
    remarks: null,
    deleted: 0,
    active: 1,
    createdBy: "system",
    createdOn: "2024-01-28",
    modifiedBy: null,
    modifiedOn: null,
    isProposal: 0,
  },
  {
    policyNo: "P100A20102016A00003",
    policyDate: "2023-11-25",
    companyID: "COMP001",
    branchID: "BR003",
    branch: "LAGOS ISLAND",
    product: "BUSINESS FIRE & SPECIAL PERILS",
    productID: "PROD003",
    bizSource: "BROKERS",
    businessType: "INWARD COINSURANCE",
    accountType: "100% Accounting",
    subRiskID: "SUB003",
    subRisk: "Electrical Building",
    partyID: "PTY003",
    party: "Bola Oluwaseun",
    mktStaffID: "MKT003",
    mktStaff: "Michael Brown",
    insuredID: "INS003",
    insSurname: "Oluwaseun",
    insFirstname: "Bola",
    insOthernames: "",
    insAddress: "789 Victoria Island, Lagos",
    insOccupation: "ELECTRICAL",
    insStateID: "LAGOS",
    insMobilePhone: "08034567890",
    insEmail: "bola.oluwaseun@example.com",
    riskLocation: "Lagos Island Industrial",
    riskClassification: "ELECTRICAL",
    entryDate: "2023-11-25",
    effectiveDate: "2023-12-01",
    expiryDate: "2024-12-01",
    exRate: 1,
    exCurrency: "NAIRA",
    proportionShare: 50,
    ourShare: 50,
    policyExcess: 0,
    status: "PENDING",
    remarks: null,
    deleted: 0,
    active: 1,
    createdBy: "system",
    createdOn: "2023-11-25",
    modifiedBy: null,
    modifiedOn: null,
    isProposal: 0,
  },
  {
    policyNo: "P100A20102016A00004",
    policyDate: "2024-02-20",
    companyID: "COMP001",
    branchID: "BR004",
    branch: "IBADAN",
    product: "FIRE CONSEQUENTIAL LOSS",
    productID: "PROD004",
    bizSource: "DIRECT",
    businessType: "FACULTATIVE INWARD",
    accountType: "Our Share Accounting",
    subRiskID: "SUB004",
    subRisk: "Food Industry",
    partyID: "PTY004",
    party: "Kunle Adeleke",
    mktStaffID: "MKT004",
    mktStaff: "Emily Davis",
    insuredID: "INS004",
    insSurname: "Adeleke",
    insFirstname: "Kunle",
    insOthernames: "",
    insAddress: "321 Ibadan Estate, Ibadan",
    insOccupation: "FOOD_PROCESSING",
    insStateID: "OYO",
    insMobilePhone: "08045678901",
    insEmail: "kunle.adeleke@example.com",
    riskLocation: "Ibadan Industrial Zone",
    riskClassification: "FOOD",
    entryDate: "2024-02-20",
    effectiveDate: "2024-03-10",
    expiryDate: "2025-03-10",
    exRate: 1,
    exCurrency: "NAIRA",
    proportionShare: 85,
    ourShare: 85,
    policyExcess: 0,
    status: "APPROVED",
    remarks: null,
    deleted: 0,
    active: 1,
    createdBy: "system",
    createdOn: "2024-02-20",
    modifiedBy: null,
    modifiedOn: null,
    isProposal: 0,
  },
];

const initialState: UnderwritingState = {
  policies: DUMMY_POLICIES, // Initialize with dummy policies
  currentPolicy: null,
  currentCalculation: null,
  calculations: DUMMY_CALCULATIONS,
  sections: [],
  selectedRiskFilter: null,
  marketingStaffs: DUMMY_MARKETING_STAFFS,
  products: DUMMY_PRODUCTS,
  branches: DUMMY_BRANCHES,
  agents: DUMMY_AGENTS,
  businessSource: DUMMY_BUSINESS_SOURCE,
  businessType: DUMMY_BUSINESS_TYPE,
  accountType: DUMMY_ACCOUNT_TYPE,
  busChannels: DUMMY_BUS_CHANNELS,
  subChannels: DUMMY_SUB_CHANNELS,
  currency: DUMMY_CURRENCY,
  occupations: DUMMY_OCCUPATIONS,
  riskClassifications: DUMMY_RISK_CLASSIFICATIONS,
  sectionsList: DUMMY_SECTIONS,
  riskSMI: DUMMY_RISK_SMI,
  loading: {
    fetchPolicies: false,
    createPolicy: false,
    updatePolicy: false,
    deletePolicy: false,
    calculate: false,
  },
  success: {
    createPolicy: false,
    updatePolicy: false,
    deletePolicy: false,
    calculate: false,
  },
  error: {
    fetchPolicies: null,
    createPolicy: null,
    updatePolicy: null,
    deletePolicy: null,
    calculate: null,
  },
  pagination: {
    page: 1,
    pageSize: 50,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  },
  searchTerm: "",
  activeTab: "active",
}

const underwritingSlice = createSlice({
  name: "underwriting",
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    setActiveTab: (state, action: PayloadAction<"active" | "drafts" | "pending" | "approved">) => {
      state.activeTab = action.payload
    },
    setCurrentPolicy: (state, action: PayloadAction<Policy | null>) => {
      state.currentPolicy = action.payload
    },
    setSelectedRiskFilter: (state, action: PayloadAction<string | null>) => {
      state.selectedRiskFilter = action.payload
    },
    setSections: (state, action: PayloadAction<PolicySection[]>) => {
      state.sections = action.payload
    },
    setCurrentCalculation: (state, action: PayloadAction<PolicyCalculation | null>) => {
      state.currentCalculation = action.payload
    },
    clearMessages: (state) => {
      state.success = {
        createPolicy: false,
        updatePolicy: false,
        deletePolicy: false,
        calculate: false,
      }
      state.error = {
        fetchPolicies: null,
        createPolicy: null,
        updatePolicy: null,
        deletePolicy: null,
        calculate: null,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch policies
      .addCase(fetchPolicies.pending, (state) => {
        state.loading.fetchPolicies = true
        state.error.fetchPolicies = null
      })
      .addCase(fetchPolicies.fulfilled, (state, action) => {
        state.loading.fetchPolicies = false
        state.policies = action.payload.items
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchPolicies.rejected, (state, action) => {
        state.loading.fetchPolicies = false
        state.error.fetchPolicies = action.payload as string
      })

      // Get policy by number
      .addCase(getPolicyByNumber.fulfilled, (state, action) => {
        state.currentPolicy = action.payload
      })

      // Create policy
      .addCase(createPolicy.pending, (state) => {
        state.loading.createPolicy = true
        state.error.createPolicy = null
        state.success.createPolicy = false
      })
      .addCase(createPolicy.fulfilled, (state, action) => {
        state.loading.createPolicy = false
        state.success.createPolicy = true
        state.policies.unshift(action.payload)
        state.currentPolicy = action.payload
      })
      .addCase(createPolicy.rejected, (state, action) => {
        state.loading.createPolicy = false
        state.error.createPolicy = action.payload as string
      })

      // Update policy
      .addCase(updatePolicy.pending, (state) => {
        state.loading.updatePolicy = true
        state.error.updatePolicy = null
        state.success.updatePolicy = false
      })
      .addCase(updatePolicy.fulfilled, (state, action) => {
        state.loading.updatePolicy = false
        state.success.updatePolicy = true
        const index = state.policies.findIndex((p) => p.policyNo === action.payload.policyNo)
        if (index !== -1) {
          state.policies[index] = action.payload
        }
        state.currentPolicy = action.payload
      })
      .addCase(updatePolicy.rejected, (state, action) => {
        state.loading.updatePolicy = false
        state.error.updatePolicy = action.payload as string
      })

      // Delete policy
      .addCase(deletePolicy.pending, (state) => {
        state.loading.deletePolicy = true
        state.error.deletePolicy = null
        state.success.deletePolicy = false
      })
      .addCase(deletePolicy.fulfilled, (state, action) => {
        state.loading.deletePolicy = false
        state.success.deletePolicy = true
        state.policies = state.policies.filter((p) => p.policyNo !== action.payload)
        if (state.currentPolicy?.policyNo === action.payload) {
          state.currentPolicy = null
        }
      })
      .addCase(deletePolicy.rejected, (state, action) => {
        state.loading.deletePolicy = false
        state.error.deletePolicy = action.payload as string
      })

      // Calculate premium
      .addCase(calculatePolicyPremium.pending, (state) => {
        state.loading.calculate = true
        state.error.calculate = null
        state.success.calculate = false
      })
      .addCase(calculatePolicyPremium.fulfilled, (state, action) => {
        state.loading.calculate = false
        state.success.calculate = true
        state.currentCalculation = action.payload
      })
      .addCase(calculatePolicyPremium.rejected, (state, action) => {
        state.loading.calculate = false
        state.error.calculate = action.payload as string
      })
  },
})

export const {
  setSearchTerm,
  setActiveTab,
  setCurrentPolicy,
  setSelectedRiskFilter,
  setSections,
  setCurrentCalculation,
  clearMessages,
  // add any other reducers you declared in reducers: { ... } above
} = underwritingSlice.actions

export default underwritingSlice.reducer
