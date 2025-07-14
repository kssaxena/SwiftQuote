import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from "react-redux";
import LoadingUI from "../../components/LoadingUI";
import ReLoginError from "../authentication/ReLoginError";

const Home = ({ startLoading, stopLoading }) => {
  const user = useSelector((store) => store.UserInfo.user);

  const [activeSection, setActiveSection] = useState("Home");

  const sections = ["Home", "Bills", "Quotations", "Estimate Invoice"];
  return user.length ? (
    <div className="flex justify-start items-start pt-20">
      <aside className="h-screen p-5 w-72 bg-neutral-100">
        <nav>
          <ul className="flex gap-5 items-start flex-col ">
            {sections.map((section, idx) => (
              <motion.li
                key={section}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 + idx * 0.5 }}
                className={`cursor-pointer transition-all duration-300 hidden lg:flex color-purple text-white rounded-xl shadow-2xl w-full p-4  ${
                  activeSection === section
                    ? "underline underline-offset-4"
                    : ""
                }`}
                onClick={() => setActiveSection(section)}
              >
                {section}
              </motion.li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="relative bg-neutral-100 w-full h-full">Hello world</main>
    </div>
  ) : (
    <div>
      <ReLoginError />
    </div>
  );
};

export default LoadingUI(Home);
