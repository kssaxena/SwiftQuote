import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import LoadingUI from "../../components/LoadingUI";
import ReLoginError from "../authentication/ReLoginError";
import Bills from "../bill-main/bills";
import DashboardHome from "../dashboard/dashboard-home";
import Estimates from "../estimates/estimates";
import { Link, useNavigate } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";
import { clearUser } from "../../utils/slice/UserInfoSlice";

const Home = ({ startLoading, stopLoading }) => {
  const user = useSelector((store) => store.UserInfo.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const Dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(
    () => localStorage.getItem("activeSection") || "Dashboard"
  );

  useEffect(() => {
    // startLoading();
    localStorage.setItem("activeSection", activeSection);
    // stopLoading()
  }, [activeSection]);

  const sections = ["Dashboard", "Bills", "Estimate Invoice"];
  return user.length ? (
    <div className="flex flex-col lg:flex-row justify-start items-start w-full">
      {/* Hamburger button (only visible on small screens) */}
      <button
        className="lg:hidden sticky top-5 left-5 z-20 p-2 rounded-lg bg-neutral-300 shadow-md"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {/* simple 3-line hamburger icon */}
        <div className="w-6 h-0.5 bg-black mb-1"></div>
        <div className="w-6 h-0.5 bg-black mb-1"></div>
        <div className="w-6 h-0.5 bg-black"></div>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen p-5 w-72 backdrop-blur-3xl pt-24 shadow transform transition-transform duration-300 z-10 lg:z-0
      ${menuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <nav>
          <ul className="flex gap-5 items-start flex-col">
            {sections.map((section, idx) => (
              <motion.li
                key={section}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 + idx * 0.5 }}
                className={`cursor-pointer transition-all duration-300 color-purple rounded-xl shadow-2xl w-full p-4 ${
                  activeSection === section
                    ? "underline underline-offset-4 text-white bg-purple-600"
                    : "bg-white text-black"
                }`}
                onClick={() => {
                  setActiveSection(section);
                  setMenuOpen(false); // close menu on click (mobile)
                }}
              >
                {section}
              </motion.li>
            ))}
            <Link
              to={`user-profile`}
              className={`cursor-pointer transition-all duration-300 color-purple rounded-xl shadow-2xl w-full p-4 ${
                activeSection === "/user-profile"
                  ? "underline underline-offset-4 text-white bg-purple-600"
                  : "bg-white text-black"
              }`}
            >
              Profile
            </Link>
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
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="bg-neutral-100 w-full h-screen pt-16">
        {activeSection === "Dashboard" && <DashboardHome />}
        {activeSection === "Bills" && <Bills />}
        {activeSection === "Estimate Invoice" && <Estimates />}
      </main>
    </div>
  ) : (
    <div>
      <ReLoginError />
      {/* <LoadingUI /> */}
    </div>
  );
};

export default LoadingUI(Home);
