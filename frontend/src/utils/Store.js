import { configureStore } from "@reduxjs/toolkit";
import UserInfoSlice from "./slice/UserInfoSlice";
// import CartList from "./Slice/CartSlice";
// import PromotionList from "./Slice/PromotionsSlice";

const store = configureStore({
  reducer: {
    UserInfo: UserInfoSlice,
    // CartList: CartList,
    // PromotionList: PromotionList,
  },
});

export default store;
