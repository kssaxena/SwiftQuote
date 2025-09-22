import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuotations } from "../../utils/slice/QuotationSlice";
import LoadingUI from "../../components/LoadingUI";
import QuotationForm from "./quotation-form";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import InputBox from "../../components/Input";
import Button from "../../components/Button";

const Quotations = ({ startLoading, stopLoading }) => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.UserInfo.user[0]);
  const Quotations = useSelector((state) => state.Quotation.quotations);
  console.log(Quotations);
  const [isActive, setIsActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const TableHeaders = [
    "Client",
    "Contact Number",
    "Quotation No.",
    "Issue Date",
    "Valid Till",
    "Status",
    "Validity",
  ];

  const filteredQuotation = Quotations.filter((quotation) => {
    const query = searchQuery.toLowerCase();
    return (
      quotation?.customerName?.toLowerCase().includes(query) ||
      quotation?.customerPhone?.toLowerCase().includes(query) ||
      quotation?.quotationNumber?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (user?._id) {
      stopLoading();
      dispatch(fetchQuotations(user._id));
    } else {
      startLoading();
    }
  }, [user, dispatch]);

  return (
    <div className="flex justify-start items-center flex-col p-5 h-full overflow-scroll relative no-scrollbar">
      <div className="sticky top-1 w-full bg-neutral-100">
        <div className="flex justify-between items-center w-full gap-4 ">
          <h1 className="text-2xl font-bold text-center">Quotations</h1>
          <Button Label="+ Generate" onClick={() => setIsActive(true)} />
        </div>
        <div className="flex justify-end w-full">
          <InputBox
            LabelName={<h1>Search among {Quotations.length} quotations</h1>}
            Value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            Type="text"
            Placeholder={"Search Quotations"}
          />
        </div>
      </div>

      {/* table */}
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
            {filteredQuotation.length > 0 ? (
              filteredQuotation.map((quotations) => (
                <tr
                  key={quotations._id}
                  className="hover:bg-gray-50 transition-colors duration-200 border-b"
                >
                  <td className="px-5 py-3 text-[#7E63F4] font-medium">
                    <Link
                      to={`/current-quotation/${quotations._id}`}
                      className="hover:underline"
                    >
                      {quotations?.customerName}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    {quotations?.customerPhone}
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    {quotations?.quotationNumber}
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    <p>
                      {new Date(
                        quotations?.quotationFromDate
                      ).toLocaleDateString()}
                    </p>
                    {/* <p className="text-xs">
                      {new Date(
                        quotations?.quotationFromDate
                      ).toLocaleTimeString()}
                    </p> */}
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    <p>
                      {new Date(
                        quotations?.quotationUptoDate
                      ).toLocaleDateString()}
                    </p>
                    {/* <p className="text-xs">
                      {new Date(
                        quotations?.quotationUptoDate
                      ).toLocaleTimeString()}
                    </p> */}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {quotations?.status}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(quotations?.quotationUptoDate) >= new Date() ? (
                      <span className="bg-green-100 text-center w-fit p-1 font-bold text-green-700 text-xs select-none">
                        Valid
                      </span>
                    ) : (
                      <span className="bg-red-100 text-center w-fit p-1 font-bold text-red-700 text-xs select-none">
                        Expired
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={TableHeaders.length}
                  className="px-5 py-6 text-center text-gray-500"
                >
                  No quotations found.
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
            <QuotationForm onCancel={() => setIsActive(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoadingUI(Quotations);
