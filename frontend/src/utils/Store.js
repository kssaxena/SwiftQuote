import { configureStore } from "@reduxjs/toolkit";
import UserInfoSlice from "./slice/UserInfoSlice";
import InvoiceSlice from "./slice/InvoiceSlice";
import EstimateSlice from "./slice/EstimateSlice";

const store = configureStore({
  reducer: {
    UserInfo: UserInfoSlice,
    Invoices: InvoiceSlice,
    Estimates: EstimateSlice,
  },
});

export default store;
