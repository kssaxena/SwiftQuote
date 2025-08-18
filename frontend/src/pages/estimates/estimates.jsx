import React, { useState } from "react";
import Button from "../../components/Button";
import LoadingUI from "../../components/LoadingUI";
import EstimateForm from "./estimate-form";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchInvoices } from "../../utils/slice/InvoiceSlice";
import { Link } from "react-router-dom";
import InputBox from "../../components/Input";
import { MdCurrencyRupee } from "react-icons/md";
import { fetchEstimates } from "../../utils/slice/EstimateSlice";

const Estimates = ({ startLoading, stopLoading }) => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.UserInfo.user[0]);
  const { invoices, loading, error } = useSelector((state) => state.Invoices);
  const { estimates } = useSelector((state) => state.Estimates);
  console.log(estimates);
  //   console.log(invoices);
  //   console.log(user._id);

  const [isActive, setIsActive] = useState(false);
  const TableHeaders = [
    "Client",
    "Contact Number",
    "Amount",
    "Invoice No #",
    "Invoice Date",
    "Payment Status",
  ];

  const [searchQuery, setSearchQuery] = useState("");

  // Filter invoices only by customerName, customerPhone, and invoiceNumber
  const filteredEstimates = estimates.filter((estimate) => {
    const query = searchQuery.toLowerCase();
    return (
      estimate?.customerName?.toLowerCase().includes(query) ||
      estimate?.customerPhone?.toLowerCase().includes(query) ||
      estimate?.invoiceNumber?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (user?._id) {
      stopLoading();
      dispatch(fetchEstimates(user._id));
    } else {
      startLoading();
    }
  }, [user, dispatch]);

  return (
    <div className="flex justify-start items-center flex-col p-5 h-full overflow-scroll relative no-scrollbar">
      <div className="sticky top-1 w-full bg-neutral-100">
        <div className="flex justify-between items-center w-full gap-4 ">
          <h1 className="text-2xl font-bold text-center">Estimate Invoice </h1>
          <Button Label="+ Generate" onClick={() => setIsActive(true)} />
        </div>
        <div className=" flex justify-end w-full ">
          <InputBox
            LabelName={<h1>Search among {estimates.length} estimates</h1>}
            Value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            Type="text"
            Placeholder={"Search Invoices"}
          />
        </div>
      </div>

      {/* table  */}
      <div className="w-full h-full mt-1">
        <table className="w-full text-sm text-left bg-white rounded-xl shadow-sm overflow-hidden">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              {TableHeaders.map((header, index) => (
                <th key={index} className="px-5 py-3 font-medium tracking-wide">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredEstimates.length > 0 ? (
              filteredEstimates.map((estimate) => (
                <tr
                  key={estimate._id}
                  className="hover:bg-gray-50 transition-colors duration-200 border-b"
                >
                  <td className="px-5 py-3 text-[#7E63F4] font-medium">
                    <Link
                      to={`/current-estimate/${estimate._id}`}
                      className="hover:underline"
                    >
                      {estimate?.customerName}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    {estimate?.customerPhone}
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    <span className="flex justify-start items-center font-semibold">
                      <MdCurrencyRupee />
                      {estimate?.billingAmount}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    {estimate?.estimateNumber}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    <p>{new Date(estimate?.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs">
                      {new Date(estimate?.createdAt).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    <p>
                      {estimate.dueAmount === 0 ? (
                        <span className="bg-green-100 text-center w-fit p-1 font-bold text-green-700 text-xs select-none">
                          Complete
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-center w-fit p-1 font-bold text-yellow-700 text-xs select-none">
                          Pending
                        </span>
                      )}
                    </p>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={TableHeaders.length}
                  className="px-5 py-6 text-center text-gray-500"
                >
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed h-screen w-screen top-0 left-0 bg-white lg:p-20 p-5 z-20 overflow-auto no-scrollbar"
          >
            <EstimateForm onCancel={() => setIsActive(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoadingUI(Estimates);
