import React, { useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import Header from "./components/Header";
import UserProfile from "./pages/profile/UserProfile";
import Register from "./pages/authentication/Register";

function App() {
  return (
    <div className="font-montserrat">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user-register" element={<Register />} />
        <Route path="/user-profile" element={<UserProfile />} />
      </Routes>
      {/* <Footer /> */}
    </div>
  );
}

export default App;
