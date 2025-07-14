import React from "react";
import { useNavigate } from "react-router-dom";
import { FaAddressCard } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { LuLogOut } from "react-icons/lu";
import { motion } from "framer-motion";
import { clearUser } from "../utils/slice/UserInfoSlice";

const Header = () => {
  const navigate = useNavigate();
  const Dispatch = useDispatch();
  const user = useSelector((store) => store.UserInfo.user);
  // console.log(user);
  const handleProfile = () => {
    navigate("/user-profile");
  };
  const handleRegister = () => {
    navigate("/user-register");
  };
  const handleHome = () => {
    navigate("/");
  };
  return (
    <div className="color-purple text-white h-20 flex justify-between items-center fixed w-full z-50">
      <button onClick={handleHome} className=" px-20">
        <motion.img
          initial={{ y: -100, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-36"
          src="https://ik.imagekit.io/cxgu0ftldb/Swift-Quote/Shift-small.png?updatedAt=1752417734632"
        />
        {/* <h1 className="bg-white text-black/80 font-bold text-2xl p-2 rounded-xl select-none">
          Swift{" "}
          <span className="color-purple text-white p-1 rounded-xl">Quote</span>
        </h1> */}
      </button>

      {/* {user?.length === 1 && (
        
      )} */}

      {user.length ? (
        <motion.div
          initial={{ y: -100, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center items-center gap-5 px-20"
        >
          <button
            onClick={handleProfile}
            className="flex justify-center items-center gap-5 bg-white text-black rounded-xl px-4 py-2 cursor-pointer shadow hover:shadow-2xl "
          >
            <img
              src={user[0]?.image[0]?.url}
              className="w-10 rounded-full"
              alt=""
            />
            <h1>{user[0]?.businessName}</h1>
          </button>
          <div className="">
            <button
              onClick={() => {
                Dispatch(clearUser());
                localStorage.removeItem("AccessToken");
                localStorage.removeItem("RefreshToken");
                alert("You are logged out! Please log in.");
                setTimeout(() => navigate("/"), 100);
                // console.log(localStorage.getItem("RefreshToken"));
              }}
              className="bg-white text-black rounded-xl px-4 py-2 cursor-pointer shadow hover:shadow-2xl "
            >
              <h1 className="flex justify-center items-center gap-2">
                <LuLogOut />
                Log Out
              </h1>
            </button>
          </div>
        </motion.div>
      ) : (
        <div className=" px-20">
          <button>
            <h1 className="flex justify-center items-center text-xl gap-5">
              <FaAddressCard />
              Kindly register first to begin...
            </h1>
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
