import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const Home = () => {
  const [activeSection, setActiveSection] = useState("Home");

  const sections = ["Home", "Bills", "Quotations", "Estimate Invoice"];
  return (
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
                  activeSection === section ? "" : ""
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
  );
};

export default Home;
