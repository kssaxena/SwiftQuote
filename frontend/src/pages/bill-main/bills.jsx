import React, { useState } from "react";
import Button from "../../components/Button";
import LoadingUI from "../../components/LoadingUI";
import Bill_form from "./bill-form";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchInvoices } from "../../utils/slice/InvoiceSlice";
import { Link } from "react-router-dom";
import InputBox from "../../components/Input";

const Bills = ({ startLoading, stopLoading }) => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.UserInfo.user[0]);
  const { invoices, loading, error } = useSelector((state) => state.Invoices);
  const [isActive, setIsActive] = useState(false);
  const TableHeaders = [
    "Customer Name",
    "Customer Contact Number",
    "Amount",
    "Invoice Number",
    "Invoice Date",
  ];

  const [searchQuery, setSearchQuery] = useState("");

  // Filter invoices only by customerName, customerPhone, and invoiceNumber
  const filteredInvoices = invoices.filter((invoice) => {
    const query = searchQuery.toLowerCase();
    return (
      invoice?.customerName?.toLowerCase().includes(query) ||
      invoice?.customerPhone?.toLowerCase().includes(query) ||
      invoice?.invoiceNumber?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    startLoading();
    if (user?._id) {
      dispatch(fetchInvoices(user._id));
    }
    stopLoading();
  }, [user, dispatch]);

  return (
    <div className="flex justify-center items-center flex-col p-5">
      <div className="flex justify-between items-center w-full gap-4 ">
        <h1 className="text-2xl font-bold text-center">Bills </h1>
        <Button Label="Generate Bill" onClick={() => setIsActive(true)} />
      </div>
      <div className=" flex justify-end w-full ">
        <InputBox
          LabelName={<h1>Search among {invoices.length} invoices</h1>}
          Value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          Type="text"
          Placeholder={"Search Invoices"}
        />
      </div>
      <div className="w-full  h-full">
        <table className="w-full border-collapse border border-gray-300 rounded-xl">
          <thead>
            <tr>
              {TableHeaders.map((header, index) => (
                <th
                  key={index}
                  className="border border-gray-500 px-4 py-2 bg-neutral-300"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td className="border border-gray-500 px-4 py-2">
                    <Link
                      className="hover:text-blue-500 underline-blue-500 hover:underline "
                      to={`/current-invoice/${invoice._id}`}
                    >
                      {invoice?.customerName}
                    </Link>
                  </td>
                  <td className="border border-gray-500 px-4 py-2">
                    {invoice?.customerPhone}
                  </td>
                  <td className="border border-gray-500 px-4 py-2">
                    {invoice?.billingAmount}
                  </td>
                  <td className="border border-gray-500 px-4 py-2">
                    {invoice?.invoiceNumber}
                  </td>
                  <td className="border border-gray-500 px-4 py-2 ">
                    <p>{new Date(invoice?.createdAt).toLocaleDateString()}</p>
                    <p>{new Date(invoice?.createdAt).toLocaleTimeString()}</p>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={TableHeaders.length} className="text-center py-4">
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
            <Bill_form onCancel={() => setIsActive(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoadingUI(Bills);
