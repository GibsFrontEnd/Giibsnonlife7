import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  // Role dialogs
  showCreateRoleDialog: boolean;
  showEditRoleDialog: boolean;
  showDeleteRoleDialog: boolean;
  showViewRoleDetailsDialog: boolean;

  // Permission dialogs (new)
  showCreatePermissionDialog: boolean;
  showEditPermissionDialog: boolean;
  showDeletePermissionDialog: boolean;
  showViewPermissionDetailsDialog: boolean;

  // User dialogs (new)
  showCreateUserDialog: boolean;
  showEditUserDialog: boolean;
  showDeleteUserDialog: boolean;
  showViewUserDetailsDialog: boolean;
  showChangePasswordDialog: boolean;

  // Product Sub risk dialogs
  showCreateProductDialog: boolean;
  showEditProductDialog: boolean;
  showDeleteProductDialog: boolean;
  showViewProductDetailsDialog: boolean;
}

const initialState: UiState = {
  // Role dialogs
  showCreateRoleDialog: false,
  showEditRoleDialog: false,
  showDeleteRoleDialog: false,
  showViewRoleDetailsDialog: false,

  // Permission dialogs
  showCreatePermissionDialog: false,
  showEditPermissionDialog: false,
  showDeletePermissionDialog: false,
  showViewPermissionDetailsDialog: false,

  // User dialogs
  showCreateUserDialog: false,
  showEditUserDialog: false,
  showDeleteUserDialog: false,
  showViewUserDetailsDialog: false,
  showChangePasswordDialog: false,

  // Product Sub risk
  showCreateProductDialog: false,
  showEditProductDialog: false,
  showDeleteProductDialog: false,
  showViewProductDetailsDialog: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Role reducers
    setShowCreateRoleDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateRoleDialog = action.payload;
    },
    setShowEditRoleDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditRoleDialog = action.payload;
    },
    setShowDeleteRoleDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteRoleDialog = action.payload;
    },
    setShowViewRoleDetailsDialog: (state, action: PayloadAction<boolean>) => {
      state.showViewRoleDetailsDialog = action.payload;
    },

    // Permission reducers
    setShowCreatePermissionDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreatePermissionDialog = action.payload;
    },
    setShowEditPermissionDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditPermissionDialog = action.payload;
    },
    setShowDeletePermissionDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeletePermissionDialog = action.payload;
    },
    setShowViewPermissionDetailsDialog: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.showViewPermissionDetailsDialog = action.payload;
    },

    // User reducers
    setShowCreateUserDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateUserDialog = action.payload;
    },
    setShowEditUserDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditUserDialog = action.payload;
    },
    setShowDeleteUserDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteUserDialog = action.payload;
    },
    setShowViewUserDetailsDialog: (state, action: PayloadAction<boolean>) => {
      state.showViewUserDetailsDialog = action.payload;
    },
    setShowChangePasswordDialog: (state, action: PayloadAction<boolean>) => {
      state.showChangePasswordDialog = action.payload;
    },

    // Product sub risk reducers
    setShowCreateProductDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateProductDialog = action.payload;
    },
    setShowEditProductDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditProductDialog = action.payload;
    },
    setShowDeleteProductDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteProductDialog = action.payload;
    },
    setShowViewProductDetailsDialog: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.showViewProductDetailsDialog = action.payload;
    },
  },
});

export const {
  // role actions
  setShowCreateRoleDialog,
  setShowEditRoleDialog,
  setShowDeleteRoleDialog,
  setShowViewRoleDetailsDialog,
  // permission actions
  setShowCreatePermissionDialog,
  setShowEditPermissionDialog,
  setShowDeletePermissionDialog,
  setShowViewPermissionDetailsDialog,
  // User actions
  setShowCreateUserDialog,
  setShowEditUserDialog,
  setShowDeleteUserDialog,
  setShowViewUserDetailsDialog,
  setShowChangePasswordDialog,
  // product sub risk actions
  setShowCreateProductDialog,
  setShowEditProductDialog,
  setShowDeleteProductDialog,
  setShowViewProductDetailsDialog,
} = uiSlice.actions;

export const selectUiState = (state: { ui: UiState }) => state.ui;

export default uiSlice.reducer;
