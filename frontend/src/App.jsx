import React, { useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FetchData } from "./utils/FetchFromApi";
import { addUser, clearUser } from "./utils/slice/UserInfoSlice";
import Home from "./pages/home/Home";
import Header from "./components/Header";
import UserProfile from "./pages/profile/UserProfile";
import Register from "./pages/authentication/Register";
import ReLoginError from "./pages/authentication/ReLoginError";
import CurrentInvoice from "./pages/current-invoice/current-invoice";

function App() {
  const user = useSelector((store) => store.UserInfo.user);
  const [reloginFailed, setReloginFailed] = useState(false);

  const dispatch = useDispatch();
  useEffect(() => {
    // Check if RefreshToken exists in localStorage
    const RefreshToken = localStorage.getItem("RefreshToken");
    if (!RefreshToken) return; // If no RefreshToken, don't proceed further

    async function reLogin() {
      try {
        const user = await FetchData("users/refresh-tokens", "post", {
          RefreshToken,
        });

        // Clear localStorage and set new tokens
        localStorage.clear(); // will clear all the data from localStorage
        localStorage.setItem("AccessToken", user.data.data.tokens.AccessToken);
        localStorage.setItem(
          "RefreshToken",
          user.data.data.tokens.RefreshToken
        );

        // Storing data inside redux store
        dispatch(clearUser());
        dispatch(addUser(user.data.data.user));
        return user;
      } catch (error) {
        console.log("Relogin error:", error);
        setReloginFailed(true); // trigger error state
      }
    }

    reLogin();
  }, []);

  return reloginFailed ? (
    <div className="font-montserrat no-scrollbar">
      <Header />
      <Routes>
        <Route path="/" element={<ReLoginError />} />
      </Routes>
    </div>
  ) : (
    <div className="font-montserrat no-scrollbar">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user-register" element={<Register />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route
          path="/current-invoice/:invoiceId"
          element={<CurrentInvoice />}
        />
      </Routes>
      {/* <Footer /> */}
    </div>
  );
}

export default App;
