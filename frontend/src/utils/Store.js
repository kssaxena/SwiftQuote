import { configureStore } from "@reduxjs/toolkit";
import UserInfoSlice from "./slice/UserInfoSlice";
import InvoiceSlice from "./slice/InvoiceSlice";

const store = configureStore({
  reducer: {
    UserInfo: UserInfoSlice,
    Invoices: InvoiceSlice,
  },
});

export default store;
