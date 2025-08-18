import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from "react-redux";
import LoadingUI from "../../components/LoadingUI";
import ReLoginError from "../authentication/ReLoginError";
import Bills from "../bill-main/bills";
import DashboardHome from "../dashboard/dashboard-home";
import Estimates from "../estimates/estimates";

const Home = ({ startLoading, stopLoading }) => {
  const user = useSelector((store) => store.UserInfo.user);

  const [activeSection, setActiveSection] = useState(
    () => localStorage.getItem("activeSection") || "Dashboard"
  );

  useEffect(() => {
    // startLoading();
    localStorage.setItem("activeSection", activeSection);
    // stopLoading()
  }, [activeSection]);

  const sections = ["Dashboard", "Bills", "Quotations", "Estimate Invoice"];
  return user.length ? (
    <div className="flex justify-start items-start  w-full ">
      <aside className="h-screen p-5 w-72 bg-neutral-200 pt-24 shadow ">
        <nav>
          <ul className="flex gap-5 items-start flex-col ">
            {sections.map((section, idx) => (
              <motion.li
                key={section}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 + idx * 0.5 }}
                className={`cursor-pointer transition-all duration-300 hidden lg:flex color-purple rounded-xl shadow-2xl w-full p-4  ${
                  activeSection === section
                    ? "underline underline-offset-4 text-white"
                    : "bg-white text-black"
                }`}
                onClick={() => setActiveSection(section)}
              >
                {section}
              </motion.li>
            ))}
          </ul>
        </nav>
      </aside>
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
