import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducers/authSlice";
import roleReducer from "./reducers/adminReducers/roleSlice";
import uiReducer from "./reducers/uiReducers/uiSlice";
import permissionReducer from "./reducers/adminReducers/permissionSlice";
import userReducer from "./reducers/adminReducers/userSlice"
import riskReducer from "./reducers/adminReducers/riskSlice"
export const store = configureStore({
  reducer: {
    risks: riskReducer,
    auth: authReducer,
    ui: uiReducer,
    roles: roleReducer,
    permissions: permissionReducer,
    users: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
