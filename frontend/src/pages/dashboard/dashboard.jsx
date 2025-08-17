import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "../../components/Button";
import Bill_form from "../bill-main/bill-form";

const Dashboard = () => {
  const [isActive, setIsActive] = useState(false);
  return (
    <div className="py-5 px-2">
      <h1 className="text-2xl font-bold text-center">Welcome to SwiftQuote</h1>
      <p className="text-center">
        Your one-stop solution for managing bills and quotations.
      </p>
      <Button Label="Generate Invoice" onClick={() => setIsActive(true)} />

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed h-screen w-screen top-0 left-0 bg-white lg:p-20 p-5 z-20 overflow-auto no-scrollbar"
          >
            <Bill_form onCancel={() => setIsActive(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
