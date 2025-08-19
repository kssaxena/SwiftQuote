import React, { useEffect, useRef, useState } from "react";
import { RiHome2Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { FaPencilAlt, FaPlus, FaTrash, FaUser } from "react-icons/fa";
import { IoPencil } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/Button";
import { IoMdClose } from "react-icons/io";
import { AnimatePresence } from "motion/react";
import { motion } from "framer-motion";
import LoadingUI from "../../components/LoadingUI";
import Bill_form from "../bill-main/bill-form";
import { fetchInvoices } from "../../utils/slice/InvoiceSlice";
import TermsAndConditionsForm from "../../components/T_C_Form";
import { BiSupport } from "react-icons/bi";
import BankDetails_form from "../../components/BankDetails_form";
import { FetchData } from "../../utils/FetchFromApi";
import EstimateForm from "../estimates/estimate-form";

const UserProfile = ({ startLoading, stopLoading }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleHome = () => {
    navigate("/");
  };
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isActive2, setIsActive2] = useState(false);
  const [bankDetail, setBankDetail] = useState();
  const user = useSelector((store) => store.UserInfo.user);
  // console.log(user);

  useEffect(() => {
    if (user[0]?._id) {
      stopLoading();
      dispatch(fetchInvoices(user[0]?._id));
    } else {
      startLoading();
    }
  }, [user, dispatch]);

  useEffect(() => {
    const getBankDetails = async () => {
      try {
        // startLoading();
        const response = await FetchData(
          `users/get-bank-detail/${user[0]?._id}`,
          "get"
        );
        setBankDetail(response.data.data);
        // alert("Details fetched successfully !");
      } catch (err) {
        // console.log(err);
      }
    };

    getBankDetails();
  }, [user]);
  // console.log(bankDetail);

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
        <div className="text-gray-800 mb-6 flex justify-between items-center gap-10">
          <div className="flex justify-center items-center gap-5 w-1/2">
            <img
              src={
                user[0]?.image[0]?.url ||
                "https://www.gravatar.com/avatar/?d=mp"
              }
              className="w-32 h-32 object-contain rounded-full color-purple shadow-2xl"
            />
          </div>
          {/* side buttons  */}
          <div className="flex justify-center items-center gap-10">
            <Button
              Label={
                <h1 className="flex flex-col justify-center items-center">
                  <RiHome2Fill />
                  Home
                </h1>
              }
              onClick={handleHome}
            />
            <Button
              Label={
                <h1 className="flex flex-col justify-center items-center">
                  <BiSupport />
                  Help Desk
                </h1>
              }
              onClick={handleHome}
            />
          </div>
        </div>
        {/* quick action button  */}
        <div className="w-full flex flex-col justify-center items-start bg-white p-6 rounded-2xl shadow-md mb-8">
          <h1>Quick Actions</h1>
          <div className="flex gap-5 p-4 ">
            {user[0]?.termsAndConditions?.descriptions ? (
              <div className="flex justify-center items-center gap-5">
                <Button
                  onClick={() => setIsOpen(true)}
                  className={`text-base flex justify-center items-center `}
                  Label={
                    <h1 className={`flex justify-center items-center gap-2`}>
                      <FaPencilAlt />
                      Edit T & C
                    </h1>
                  }
                />
              </div>
            ) : (
              <div className=" px-20">
                <Button
                  onClick={() => setIsOpen(true)}
                  className={`text-base flex justify-center items-center `}
                  Label={
                    <h1 className={`flex justify-center items-center gap-2`}>
                      <FaPlus />
                      Terms and Conditions
                    </h1>
                  }
                />
              </div>
            )}
            {bankDetail ? (
              <Button
                Label={
                  <h1 className="flex justify-center items-center gap-2">
                    {<FaPencilAlt />} Bank Details
                  </h1>
                }
                onClick={() => setIsOpen2(true)}
              />
            ) : (
              <Button
                Label={
                  <h1 className="flex justify-center items-center gap-2">
                    {<FaPlus />} Bank Details
                  </h1>
                }
                onClick={() => setIsOpen2(true)}
              />
            )}
            <Button
              Label={
                <h1 className="flex justify-center items-center gap-2">
                  {<FaPlus />}New Invoice
                </h1>
              }
              onClick={() => setIsActive(true)}
            />
            <Button
              Label={
                <h1 className="flex justify-center items-center gap-2">
                  {<FaPlus />}New Estimate
                </h1>
              }
              onClick={() => setIsActive2(true)}
            />
          </div>
        </div>

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

        {/* Banking Details */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Banking Details
          </h2>
          {bankDetail ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div>
                <strong>Bank Name:</strong> {bankDetail?.bankName}
              </div>
              <div>
                <strong>Account Number:</strong> {bankDetail?.accountNumber}
              </div>
              <div>
                <strong>Bank Branch:</strong> {bankDetail?.branchName}
              </div>
              <div>
                <strong>Account Holder Name:</strong>{" "}
                {bankDetail?.accountHolderName}
              </div>
              <div>
                <strong>IFSC Code:</strong> {bankDetail?.ifscCode}
              </div>
              <div>
                <strong>UPI Id:</strong> {bankDetail?.upiId}
              </div>
            </div>
          ) : (
            <div>No Banking Details</div>
          )}
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
              <strong>Company Address:</strong>{" "}
              {businessDetails.businessAddress}
            </div>
            <div>
              <strong>Company Contact:</strong>{" "}
              {businessDetails.businessContact}
            </div>
            <div>
              <strong>Company Email:</strong> {businessDetails.businessEmail}
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

        {/* Terms and conditions */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Terms and Conditions
          </h2>
          <div className=" gap-4 text-gray-600">
            <ul>
              {user[0]?.termsAndConditions?.descriptions?.map((item, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 flex gap-2 items-start"
                >
                  <span className="font-medium text-gray-600">
                    {index + 1}.
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isActive2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed h-screen w-screen top-0 left-0 bg-white lg:p-20 p-5 z-20 overflow-auto no-scrollbar"
          >
            <EstimateForm onCancel={() => setIsActive2(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed top-0 left-0 flex flex-col justify-center items-center backdrop-blur-3xl w-full h-full z-20"
          >
            <Button
              onClick={() => setIsOpen2(false)}
              Label={<IoMdClose className="text-xl" />}
            />
            <BankDetails_form onClose={() => setIsOpen2(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed top-0 left-0 flex flex-col justify-center items-center backdrop-blur-3xl w-full h-full z-20 py-20"
          >
            <Button
              onClick={() => setIsOpen(false)}
              Label={<IoMdClose className="text-xl" />}
            />
            <TermsAndConditionsForm
              startLoading={startLoading}
              stopLoading={stopLoading}
              onClose={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
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

export default LoadingUI(UserProfile);
