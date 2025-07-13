import { createSlice } from "@reduxjs/toolkit";

const UserInfo = createSlice({
  name: "userinfo",
  initialState: {
    user: [],
  },
  reducers: {
    addUser: (state, action) => {
      state.user.push(action.payload);
    },

    clearUser: (state) => {
      state.user = [];
    },
  },
});

export const { addUser, clearUser } = UserInfo.actions;

export default UserInfo.reducer;
