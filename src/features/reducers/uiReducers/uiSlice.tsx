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

  // Risk dialogs (new)
  showCreateRiskDialog: boolean;
  showEditRiskDialog: boolean;
  showDeleteRiskDialog: boolean;
  showViewRiskDetailsDialog: boolean;

  // Risk dialogs (new)
  showCreateSubRiskSectionDialog: boolean;
  showEditSubRiskSectionDialog: boolean;
  showDeleteSubRiskSectionDialog: boolean;
  showViewSubRiskSectionDetailsDialog: boolean;

  // Product Sub risk dialogs
  showCreateProductDialog: boolean;
  showEditProductDialog: boolean;
  showDeleteProductDialog: boolean;
  showViewProductDetailsDialog: boolean;

  showCreateRegionDialog: boolean;
  showEditRegionDialog: boolean;
  showDeleteRegionDialog: boolean;
  showViewRegionDetailsDialog: boolean;

  showCreateBranchDialog: boolean;
  showEditBranchDialog: boolean;
  showDeleteBranchDialog: boolean;
  showViewBranchDetailsDialog: boolean;
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

  // Risk dialogs (new)
  showCreateRiskDialog: false,
  showEditRiskDialog: false,
  showDeleteRiskDialog: false,
  showViewRiskDetailsDialog: false,

  showCreateSubRiskSectionDialog: false,
  showEditSubRiskSectionDialog: false,
  showDeleteSubRiskSectionDialog: false,
  showViewSubRiskSectionDetailsDialog: false,
  // Product Sub risk
  showCreateProductDialog: false,
  showEditProductDialog: false,
  showDeleteProductDialog: false,
  showViewProductDetailsDialog: false,

  showCreateRegionDialog: false,
  showEditRegionDialog: false,
  showDeleteRegionDialog: false,
  showViewRegionDetailsDialog: false,

  showCreateBranchDialog: false,
  showEditBranchDialog: false,
  showDeleteBranchDialog: false,
  showViewBranchDetailsDialog: false,
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

    // Risk reducers
    setShowCreateRiskDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateRiskDialog = action.payload;
    },
    setShowEditRiskDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditRiskDialog = action.payload;
    },
    setShowDeleteRiskDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteRiskDialog = action.payload;
    },
    setShowViewRiskDetailsDialog: (state, action: PayloadAction<boolean>) => {
      state.showViewRiskDetailsDialog = action.payload;
    },

    // Risk reducers
    setShowCreateSubRiskSectionDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateSubRiskSectionDialog = action.payload;
    },
    setShowEditSubRiskSectionDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditSubRiskSectionDialog = action.payload;
    },
    setShowDeleteSubRiskSectionDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteSubRiskSectionDialog = action.payload;
    },
    setShowViewSubRiskSectionDetailsDialog: (state, action: PayloadAction<boolean>) => {
      state.showViewSubRiskSectionDetailsDialog = action.payload;
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

    setShowCreateRegionDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateRegionDialog = action.payload;
    },
    setShowEditRegionDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditRegionDialog = action.payload;
    },
    setShowDeleteRegionDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteRegionDialog = action.payload;
    },
    setShowViewRegionDetailsDialog: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.showViewRegionDetailsDialog = action.payload;
    },

    setShowCreateBranchDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateBranchDialog = action.payload;
    },
    setShowEditBranchDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditBranchDialog = action.payload;
    },
    setShowDeleteBranchDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteBranchDialog = action.payload;
    },
    setShowViewBranchDetailsDialog: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.showViewBranchDetailsDialog = action.payload;
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

  // Risk actions
  setShowCreateRiskDialog,
  setShowEditRiskDialog,
  setShowDeleteRiskDialog,
  setShowViewRiskDetailsDialog,

  // Risk actions
  setShowCreateSubRiskSectionDialog,
  setShowEditSubRiskSectionDialog,
  setShowDeleteSubRiskSectionDialog,
  setShowViewSubRiskSectionDetailsDialog,

  // product sub risk actions
  setShowCreateProductDialog,
  setShowEditProductDialog,
  setShowDeleteProductDialog,
  setShowViewProductDetailsDialog,

  setShowCreateRegionDialog,
  setShowEditRegionDialog,
  setShowDeleteRegionDialog,
  setShowViewRegionDetailsDialog,

  setShowCreateBranchDialog,
  setShowEditBranchDialog,
  setShowDeleteBranchDialog,
  setShowViewBranchDetailsDialog,
} = uiSlice.actions;

export const selectUiState = (state: { ui: UiState }) => state.ui;

export default uiSlice.reducer;
