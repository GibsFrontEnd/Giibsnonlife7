import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  // Role dialogs
  showCreateRoleDialog: boolean;
  showEditRoleDialog: boolean;
  showDeleteRoleDialog: boolean;
  showViewRoleDetailsDialog: boolean;

  // Permission dialogs
  showCreatePermissionDialog: boolean;
  showEditPermissionDialog: boolean;
  showDeletePermissionDialog: boolean;
  showViewPermissionDetailsDialog: boolean;

  // User dialogs
  showCreateUserDialog: boolean;
  showEditUserDialog: boolean;
  showDeleteUserDialog: boolean;
  showViewUserDetailsDialog: boolean;
  showChangePasswordDialog: boolean;

  // Risk dialogs
  showCreateRiskDialog: boolean;
  showEditRiskDialog: boolean;
  showDeleteRiskDialog: boolean;
  showViewRiskDetailsDialog: boolean;

  // Sub Risk Section dialogs
  showCreateSubRiskSectionDialog: boolean;
  showEditSubRiskSectionDialog: boolean;
  showDeleteSubRiskSectionDialog: boolean;
  showViewSubRiskSectionDetailsDialog: boolean;

  // Product dialogs
  showCreateProductDialog: boolean;
  showEditProductDialog: boolean;
  showDeleteProductDialog: boolean;
  showViewProductDetailsDialog: boolean;

  // Region dialogs (NEW - added here)
  showCreateRegionDialog: boolean;
  showEditRegionDialog: boolean;
  showDeleteRegionDialog: boolean;
  showViewRegionDetailsDialog: boolean;
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

  // Risk dialogs
  showCreateRiskDialog: false,
  showEditRiskDialog: false,
  showDeleteRiskDialog: false,
  showViewRiskDetailsDialog: false,

  // Sub Risk Section dialogs
  showCreateSubRiskSectionDialog: false,
  showEditSubRiskSectionDialog: false,
  showDeleteSubRiskSectionDialog: false,
  showViewSubRiskSectionDetailsDialog: false,

  // Product dialogs
  showCreateProductDialog: false,
  showEditProductDialog: false,
  showDeleteProductDialog: false,
  showViewProductDetailsDialog: false,

  // Region dialogs (NEW - added here)
  showCreateRegionDialog: false,
  showEditRegionDialog: false,
  showDeleteRegionDialog: false,
  showViewRegionDetailsDialog: false,
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

    // Sub Risk Section reducers
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

    // Product reducers
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

    // Region reducers (NEW - added here)
    setShowCreateRegionDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateRegionDialog = action.payload;
    },
    setShowEditRegionDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditRegionDialog = action.payload;
    },
    setShowDeleteRegionDialog: (state, action: PayloadAction<boolean>) => {
      state.showDeleteRegionDialog = action.payload;
    },
    setShowViewRegionDetailsDialog: (state, action: PayloadAction<boolean>) => {
      state.showViewRegionDetailsDialog = action.payload;
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

  // Sub Risk Section actions
  setShowCreateSubRiskSectionDialog,
  setShowEditSubRiskSectionDialog,
  setShowDeleteSubRiskSectionDialog,
  setShowViewSubRiskSectionDetailsDialog,

  // product actions
  setShowCreateProductDialog,
  setShowEditProductDialog,
  setShowDeleteProductDialog,
  setShowViewProductDetailsDialog,

  // Region actions (NEW - added here)
  setShowCreateRegionDialog,
  setShowEditRegionDialog,
  setShowDeleteRegionDialog,
  setShowViewRegionDetailsDialog,
} = uiSlice.actions;

export const selectUiState = (state: { ui: UiState }) => state.ui;

export default uiSlice.reducer;