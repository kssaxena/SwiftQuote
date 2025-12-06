import { configureStore } from "@reduxjs/toolkit";
import UserInfoSlice from "./slice/UserInfoSlice";
import InvoiceSlice from "./slice/InvoiceSlice";
import EstimateSlice from "./slice/EstimateSlice";
import QuotationSlice from "./slice/QuotationSlice";
import ProductSlice from "./slice/ProductSlice";

const store = configureStore({
  reducer: {
    UserInfo: UserInfoSlice,
    Invoices: InvoiceSlice,
    Estimates: EstimateSlice,
    Quotation: QuotationSlice,
    Products: ProductSlice,
  },
});

export default store;
