import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type {
  SubRiskSection,
  CreateSubRiskSectionRequest,
  UpdateSubRiskSectionRequest,
  SubRiskSectionState,
} from "../../../types/subRiskSection"
import type { RootState } from "../../store"

const API_BASE_URL = "https://core-api.newgibsonline.com/api"

// You'll need to get this token from your auth system
const getAuthToken = () => {
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoicGVsbHVtaSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWVpZGVudGlmaWVyIjoiNjM0IiwiZXhwIjoxNzU2NjA3MDc1fQ.IS6kuxNBX_0W0pq9A-V1VeZxkGlaHiqbOORdkV7J40M"
}

// Async thunks
export const getAllSubRiskSections = createAsyncThunk(
  "subRiskSections/getAllSubRiskSections",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/SubRiskSections`, {
        method: "GET",
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SubRiskSection[] = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch sub risk sections")
    }
  },
)

export const getSubRiskSectionById = createAsyncThunk(
  "subRiskSections/getSubRiskSectionById",
  async (sectionId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/SubRiskSections/${sectionId}`, {
        method: "GET",
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SubRiskSection = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch sub risk section")
    }
  },
)

export const getSubRiskSectionsBySectionCode = createAsyncThunk(
  "subRiskSections/getSubRiskSectionsBySectionCode",
  async (sectionCode: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/SubRiskSections/by-section-code/${sectionCode}`, {
        method: "GET",
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SubRiskSection[] = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch sub risk sections by section code")
    }
  },
)

export const getSubRiskSectionsBySubRisk = createAsyncThunk(
  "subRiskSections/getSubRiskSectionsBySubRisk",
  async (subRiskId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/SubRiskSections/by-subrisk/${subRiskId}`, {
        method: "GET",
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SubRiskSection[] = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch sub risk sections by sub risk")
    }
  },
)

export const getActiveSubRiskSections = createAsyncThunk(
  "subRiskSections/getActiveSubRiskSections",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/SubRiskSections/active`, {
        method: "GET",
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SubRiskSection[] = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch active sub risk sections")
    }
  },
)

export const checkSubRiskSectionExists = createAsyncThunk(
  "subRiskSections/checkSubRiskSectionExists",
  async (sectionId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/SubRiskSections/${sectionId}/exists`, {
        method: "GET",
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: boolean = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to check if sub risk section exists")
    }
  },
)

export const createSubRiskSection = createAsyncThunk(
  "subRiskSections/createSubRiskSection",
  async (subRiskSectionData: CreateSubRiskSectionRequest, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/SubRiskSections`, {
        method: "POST",
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subRiskSectionData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SubRiskSection = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create sub risk section")
    }
  },
)

export const updateSubRiskSection = createAsyncThunk(
  "subRiskSections/updateSubRiskSection",
  async (
    { id, subRiskSectionData }: { id: number; subRiskSectionData: UpdateSubRiskSectionRequest },
    { rejectWithValue },
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/SubRiskSections/${id}`, {
        method: "PUT",
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subRiskSectionData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SubRiskSection = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update sub risk section")
    }
  },
)

export const deleteSubRiskSection = createAsyncThunk(
  "subRiskSections/deleteSubRiskSection",
  async (sectionId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/SubRiskSections/${sectionId}`, {
        method: "DELETE",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return sectionId
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete sub risk section")
    }
  },
)

const initialState: SubRiskSectionState = {
  subRiskSections: [],
  loading: {
    getAllSubRiskSections: false,
    getSubRiskSectionById: false,
    getSubRiskSectionsBySectionCode: false,
    getSubRiskSectionsBySubRisk: false,
    getActiveSubRiskSections: false,
    checkSubRiskSectionExists: false,
    createSubRiskSection: false,
    updateSubRiskSection: false,
    deleteSubRiskSection: false,
  },
  success: {
    createSubRiskSection: false,
    updateSubRiskSection: false,
    deleteSubRiskSection: false,
  },
  error: {
    getAllSubRiskSections: null,
    getSubRiskSectionById: null,
    getSubRiskSectionsBySectionCode: null,
    getSubRiskSectionsBySubRisk: null,
    getActiveSubRiskSections: null,
    checkSubRiskSectionExists: null,
    createSubRiskSection: null,
    updateSubRiskSection: null,
    deleteSubRiskSection: null,
  },
  exists: null,
}

const subRiskSectionSlice = createSlice({
  name: "subRiskSections",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.success = {
        createSubRiskSection: false,
        updateSubRiskSection: false,
        deleteSubRiskSection: false,
      }
      state.error = {
        getAllSubRiskSections: null,
        getSubRiskSectionById: null,
        getSubRiskSectionsBySectionCode: null,
        getSubRiskSectionsBySubRisk: null,
        getActiveSubRiskSections: null,
        checkSubRiskSectionExists: null,
        createSubRiskSection: null,
        updateSubRiskSection: null,
        deleteSubRiskSection: null,
      }
      state.exists = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all sub risk sections
      .addCase(getAllSubRiskSections.pending, (state) => {
        state.loading.getAllSubRiskSections = true
        state.error.getAllSubRiskSections = null
      })
      .addCase(getAllSubRiskSections.fulfilled, (state, action: PayloadAction<SubRiskSection[]>) => {
        state.loading.getAllSubRiskSections = false
        state.subRiskSections = action.payload
      })
      .addCase(getAllSubRiskSections.rejected, (state, action) => {
        state.loading.getAllSubRiskSections = false
        state.error.getAllSubRiskSections = action.payload as string
      })

      // Get sub risk section by ID
      .addCase(getSubRiskSectionById.pending, (state) => {
        state.loading.getSubRiskSectionById = true
        state.error.getSubRiskSectionById = null
      })
      .addCase(getSubRiskSectionById.fulfilled, (state, action: PayloadAction<SubRiskSection>) => {
        state.loading.getSubRiskSectionById = false
        const index = state.subRiskSections.findIndex((s) => s.sectionID === action.payload.sectionID)
        if (index !== -1) {
          state.subRiskSections[index] = action.payload
        }
      })
      .addCase(getSubRiskSectionById.rejected, (state, action) => {
        state.loading.getSubRiskSectionById = false
        state.error.getSubRiskSectionById = action.payload as string
      })

      // Get sub risk sections by section code
      .addCase(getSubRiskSectionsBySectionCode.pending, (state) => {
        state.loading.getSubRiskSectionsBySectionCode = true
        state.error.getSubRiskSectionsBySectionCode = null
      })
      .addCase(getSubRiskSectionsBySectionCode.fulfilled, (state, action: PayloadAction<SubRiskSection[]>) => {
        state.loading.getSubRiskSectionsBySectionCode = false
        state.subRiskSections = action.payload
      })
      .addCase(getSubRiskSectionsBySectionCode.rejected, (state, action) => {
        state.loading.getSubRiskSectionsBySectionCode = false
        state.error.getSubRiskSectionsBySectionCode = action.payload as string
      })

      // Get sub risk sections by sub risk
      .addCase(getSubRiskSectionsBySubRisk.pending, (state) => {
        state.loading.getSubRiskSectionsBySubRisk = true
        state.error.getSubRiskSectionsBySubRisk = null
      })
      .addCase(getSubRiskSectionsBySubRisk.fulfilled, (state, action: PayloadAction<SubRiskSection[]>) => {
        state.loading.getSubRiskSectionsBySubRisk = false
        state.subRiskSections = action.payload
      })
      .addCase(getSubRiskSectionsBySubRisk.rejected, (state, action) => {
        state.loading.getSubRiskSectionsBySubRisk = false
        state.error.getSubRiskSectionsBySubRisk = action.payload as string
      })

      // Get active sub risk sections
      .addCase(getActiveSubRiskSections.pending, (state) => {
        state.loading.getActiveSubRiskSections = true
        state.error.getActiveSubRiskSections = null
      })
      .addCase(getActiveSubRiskSections.fulfilled, (state, action: PayloadAction<SubRiskSection[]>) => {
        state.loading.getActiveSubRiskSections = false
        state.subRiskSections = action.payload
      })
      .addCase(getActiveSubRiskSections.rejected, (state, action) => {
        state.loading.getActiveSubRiskSections = false
        state.error.getActiveSubRiskSections = action.payload as string
      })

      // Check if sub risk section exists
      .addCase(checkSubRiskSectionExists.pending, (state) => {
        state.loading.checkSubRiskSectionExists = true
        state.error.checkSubRiskSectionExists = null
      })
      .addCase(checkSubRiskSectionExists.fulfilled, (state, action: PayloadAction<boolean>) => {
        state.loading.checkSubRiskSectionExists = false
        state.exists = action.payload
      })
      .addCase(checkSubRiskSectionExists.rejected, (state, action) => {
        state.loading.checkSubRiskSectionExists = false
        state.error.checkSubRiskSectionExists = action.payload as string
      })

      // Create sub risk section
      .addCase(createSubRiskSection.pending, (state) => {
        state.loading.createSubRiskSection = true
        state.error.createSubRiskSection = null
        state.success.createSubRiskSection = false
      })
      .addCase(createSubRiskSection.fulfilled, (state, action: PayloadAction<SubRiskSection>) => {
        state.loading.createSubRiskSection = false
        state.success.createSubRiskSection = true
        state.subRiskSections.unshift(action.payload)
      })
      .addCase(createSubRiskSection.rejected, (state, action) => {
        state.loading.createSubRiskSection = false
        state.error.createSubRiskSection = action.payload as string
      })

      // Update sub risk section
      .addCase(updateSubRiskSection.pending, (state) => {
        state.loading.updateSubRiskSection = true
        state.error.updateSubRiskSection = null
        state.success.updateSubRiskSection = false
      })
      .addCase(updateSubRiskSection.fulfilled, (state, action: PayloadAction<SubRiskSection>) => {
        state.loading.updateSubRiskSection = false
        state.success.updateSubRiskSection = true
        const index = state.subRiskSections.findIndex((s) => s.sectionID === action.payload.sectionID)
        if (index !== -1) {
          state.subRiskSections[index] = action.payload
        }
      })
      .addCase(updateSubRiskSection.rejected, (state, action) => {
        state.loading.updateSubRiskSection = false
        state.error.updateSubRiskSection = action.payload as string
      })

      // Delete sub risk section
      .addCase(deleteSubRiskSection.pending, (state) => {
        state.loading.deleteSubRiskSection = true
        state.error.deleteSubRiskSection = null
        state.success.deleteSubRiskSection = false
      })
      .addCase(deleteSubRiskSection.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading.deleteSubRiskSection = false
        state.success.deleteSubRiskSection = true
        state.subRiskSections = state.subRiskSections.filter((s) => s.sectionID !== action.payload)
      })
      .addCase(deleteSubRiskSection.rejected, (state, action) => {
        state.loading.deleteSubRiskSection = false
        state.error.deleteSubRiskSection = action.payload as string
      })
  },
})

export const { clearMessages } = subRiskSectionSlice.actions

export const selectSubRiskSections = (state: RootState) => state.subRiskSections

export default subRiskSectionSlice.reducer
