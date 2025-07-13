import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const handleProfile = () => {
    navigate("/user-profile");
  };
  return (
    <div className="color-purple text-white h-20 flex justify-between items-center fixed w-full z-50">
      <div className=" px-20">
        <h1 className="bg-white text-black/80 font-bold text-2xl p-2 rounded-xl select-none">
          Swift{" "}
          <span className="color-purple text-white p-1 rounded-xl">Quote</span>
        </h1>
      </div>
      <div className="flex justify-center items-center gap-5 px-20">
        <img
          src="https://ik.imagekit.io/pz8qfunss/Products/saree/Spandana%20Somanna%20_%20Celebrity_com.jpeg?updatedAt=1751705845270"
          className="w-10 rounded-full"
          alt=""
        />
        <button onClick={handleProfile}>Your Profile</button>
      </div>
    </div>
  );
};

export default Header;
