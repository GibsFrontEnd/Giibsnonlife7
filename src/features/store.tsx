import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducers/authSlice";
import roleReducer from "./reducers/adminReducers/roleSlice";
import uiReducer from "./reducers/uiReducers/uiSlice";
import permissionReducer from "./reducers/adminReducers/permissionSlice";
import userReducer from "./reducers/adminReducers/userSlice";
import riskReducer from "./reducers/productReducers/riskSlice";
import productReducer from "./reducers/productReducers/productSlice";
import subRiskSMIReducer from "./reducers/productReducers/subRiskSMISlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    roles: roleReducer,
    permissions: permissionReducer,
    users: userReducer,
    risks: riskReducer,
    products: productReducer,
    subRiskSMIs: subRiskSMIReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
