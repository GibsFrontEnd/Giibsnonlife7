import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducers/authSlice";
import roleReducer from "./reducers/adminReducers/roleSlice";
import uiReducer from "./reducers/uiReducers/uiSlice";
import permissionReducer from "./reducers/adminReducers/permissionSlice";
import userReducer from "./reducers/adminReducers/userSlice";
import riskReducer from "./reducers/adminReducers/riskSlice";
import productReducer from "./reducers/productReducers/productSlice";
import subRiskSectionReducer from "./reducers/productReducers/subRiskSectionSlice"
import subRiskSMIReducer from "./reducers/productReducers/subRiskSMISlice";
import regionReducer from "./reducers/companyReducers/regionSlice";
import branchReducer from "./reducers/companyReducers/branchSlice";
import marketingStaffReducer from "./reducers/companyReducers/marketingStaffSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    roles: roleReducer,
    permissions: permissionReducer,
    users: userReducer,
    risks: riskReducer,
    products: productReducer,
    subRiskSections: subRiskSectionReducer,
    subRiskSMIs: subRiskSMIReducer,
    regions: regionReducer,
    branches: branchReducer,
    marketingStaff: marketingStaffReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
