import { createSlice } from "@reduxjs/toolkit";

interface UiState {
  showCreateRoleDialog: boolean;
  showEditRoleDialog: boolean;
  showDeleteRoleDialog: boolean;
  showViewRoleDetailsDialog: boolean;
}

const initialState: UiState = {
  showCreateRoleDialog: false,
  showEditRoleDialog: false,
  showDeleteRoleDialog: false,
  showViewRoleDetailsDialog: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setShowCreateRoleDialog: (state, action) => {
      state.showCreateRoleDialog = action.payload;
    },
    setShowEditRoleDialog: (state, action) => {
      state.showEditRoleDialog = action.payload;
    },
    setShowDeleteRoleDialog: (state, action) => {
      state.showDeleteRoleDialog = action.payload;
    },
    setShowViewRoleDetailsDialog: (state, action) => {
      state.showViewRoleDetailsDialog = action.payload;
    },
  },
});

export const {
  setShowCreateRoleDialog,
  setShowEditRoleDialog,
  setShowDeleteRoleDialog,
  setShowViewRoleDetailsDialog,
} = uiSlice.actions;

export const selectUiState = (state: { ui: UiState }) => state.ui;
export default uiSlice.reducer;
