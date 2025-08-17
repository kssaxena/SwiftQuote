import React, { useState } from "react";
import Button from "../../components/Button";
import LoadingUI from "../../components/LoadingUI";
import Bill_form from "./bill-form";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from "react-redux";

const Bills = ({ startLoading, stopLoading }) => {
  const user = useSelector((store) => store.UserInfo.user);
  const [isActive, setIsActive] = useState(false);
  return (
    <div className="flex justify-center items-center">
      <Button Label="Generate Bill" onClick={() => setIsActive(true)} />
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

export default LoadingUI(Bills);
