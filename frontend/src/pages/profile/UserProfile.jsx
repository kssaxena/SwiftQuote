import React, { useState } from "react";
import { RiHome2Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTrash } from "react-icons/fa";
import { IoPencil } from "react-icons/io5";
import { useSelector } from "react-redux";
import CreateTemplate from "../../components/CreateTemplate";
import Button from "../../components/Button";
import { IoMdClose } from "react-icons/io";
import { AnimatePresence } from "motion/react";
import { motion } from "framer-motion";
import LoadingUI from "../../components/LoadingUI";

const UserProfile = ({ startLoading, stopLoading }) => {
  const navigate = useNavigate();
  const handleHome = () => {
    navigate("/");
  };

  const user = useSelector((store) => store.UserInfo.user);
  // console.log(user);
  const [isOpen, setIsOpen] = useState(false);

  const personalDetails = {
    name: user[0]?.name,
    email: user[0]?.email,
    password: user[0]?.name,
    contact: user[0]?.contact,
  };

  const businessDetails = {
    companyName: user[0]?.businessName,
    gstNumber: user[0]?.gstNumber,
    businessAddress: user[0]?.businessAddress,
    businessContact: user[0]?.businessContact,
    businessEmail: user[0]?.businessEmail,
    businessCity: user[0]?.businessCity,
    businessState: user[0]?.businessState,
    businessPinCode: user[0]?.businessPinCode,
  };

  return (
    <div className="pt-20">
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex justify-start items-center gap-10">
          Profile Details{" "}
          <button onClick={handleHome}>
            <RiHome2Fill className="hover:text-neutral-600 duration-300 ease-in-out hover:cursor-pointer" />
          </button>
          <Button
            onClick={() => setIsOpen(true)}
            className={`text-base flex justify-center items-center `}
            Label={
              <h1
                className={`text-base flex justify-center items-center gap-2 font-light`}
              >
                <FaPlus />
                Template
              </h1>
            }
          />
        </h1>

        {/* Personal Details */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <div>
              <strong>Name:</strong> {personalDetails.name}
            </div>
            <div>
              <strong>Email:</strong> {personalDetails.email}
            </div>
            <div>
              <strong>Password:</strong> {personalDetails.password}
            </div>
            <div>
              <strong>Contact Number:</strong> {personalDetails.contact}
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Business Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <div>
              <strong>Company Name:</strong> {businessDetails.companyName}
            </div>
            <div>
              <strong>GST Number:</strong> {businessDetails.gstNumber}
            </div>
            <div>
              <strong>Business Address:</strong>{" "}
              {businessDetails.businessAddress}
            </div>
            <div>
              <strong>Business Contact:</strong>{" "}
              {businessDetails.businessContact}
            </div>
            <div>
              <strong>Business Email:</strong> {businessDetails.businessEmail}
            </div>
            <div>
              <strong>City:</strong> {businessDetails.businessCity}
            </div>
            <div>
              <strong>State:</strong> {businessDetails.businessState}
            </div>
            <div>
              <strong>Pin Code:</strong> {businessDetails.businessPinCode}
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Templates
          </h2>
          <div className=" gap-4 text-gray-600">
            <div className="flex justify-between items-center bg-neutral-100 p-2 rounded-2xl px-10">
              <div>
                <strong>Template 1:</strong> {businessDetails.companyName}
              </div>
              <div className="gap-5 flex justify-center items-center px-10">
                <button>
                  <IoPencil />
                </button>
                <button>
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed top-0 left-0 flex flex-col  justify-center items-center backdrop-blur-3xl w-full h-full"
          >
            <Button
              onClick={() => setIsOpen(false)}
              Label={<IoMdClose className="text-xl" />}
            />
            <CreateTemplate />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoadingUI(UserProfile);
