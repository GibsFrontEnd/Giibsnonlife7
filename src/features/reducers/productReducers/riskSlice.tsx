import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiCall from "../../../utils/api-call";
import { RiskState } from "../../../types/risk";

export const getAllRisks = createAsyncThunk(
  "risks/getAllRisks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiCall.get(`/risks`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState: RiskState = {
  risks: [],

  loading: {
    getAllRisks: false,
  },
  error: {
    getAllRisks: null,
  },
};

const riskSlice = createSlice({
  name: "risks",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = { ...initialState.error };
    },
    clearRisks: (state) => {
      state.risks = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Risks
      .addCase(getAllRisks.pending, (state) => {
        state.loading.getAllRisks = true;
        state.error.getAllRisks = null;
      })
      .addCase(getAllRisks.fulfilled, (state, action) => {
        state.loading.getAllRisks = false;
        state.risks = action.payload;
      })
      .addCase(getAllRisks.rejected, (state, action) => {
        state.loading.getAllRisks = false;
        state.error.getAllRisks = action.payload;
      });
  },
});

export const selectRisks = (state: { risks: RiskState }) =>
  state.risks;

export const { clearMessages, clearRisks } = riskSlice.actions;

export default riskSlice.reducer;