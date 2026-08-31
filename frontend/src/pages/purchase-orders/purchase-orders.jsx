import React, { useState } from "react";
import Button from "../../components/Button";
import LoadingUI from "../../components/LoadingUI";
import PurchaseOrderForm from "./purchase-order-form";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchPurchaseOrders } from "../../utils/slice/PurchaseOrderSlice";
import { Link } from "react-router-dom";
import InputBox from "../../components/Input";
import { MdCurrencyRupee } from "react-icons/md";
import { formatDateString } from "../../utils/mongoDB_DateTime";

const PurchaseOrders = ({ startLoading, stopLoading }) => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.UserInfo.user[0]);
  const {
    purchaseOrders = [],
    loading,
    error,
  } = useSelector((state) => state.PurchaseOrders || {});
  const [isActive, setIsActive] = useState(false);
  const TableHeaders = [
    "Supplier",
    "Contact Number",
    "Amount",
    "PO No #",
    "Creation Date",
    "Status",
  ];

  const [searchQuery, setSearchQuery] = useState("");

  // Filter purchase orders by supplierName, supplierPhone, and purchaseOrderNumber
  const filteredPurchaseOrders = purchaseOrders.filter((po) => {
    const query = searchQuery.toLowerCase();
    return (
      po?.supplierName?.toLowerCase().includes(query) ||
      po?.supplierPhone?.toLowerCase().includes(query) ||
      po?.purchaseOrderNumber?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchPurchaseOrders(user._id));
    }
  }, [user, dispatch]);

  return (
    <div className="flex justify-start items-center flex-col p-5 h-full overflow-scroll relative no-scrollbar">
      <div className="sticky top-1 w-full bg-neutral-100">
        <div className="flex justify-between items-center w-full gap-4 ">
          <h1 className="text-2xl font-bold text-center">Purchase Orders</h1>
          <Button Label="+ Generate" onClick={() => setIsActive(true)} />
        </div>
        <div className=" flex justify-end w-full ">
          <InputBox
            LabelName={<h1>Search among {purchaseOrders.length} orders</h1>}
            Value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            Type="text"
            Placeholder={"Search Purchase Orders"}
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
            {filteredPurchaseOrders.length > 0 ? (
              filteredPurchaseOrders.map((po) => (
                <tr
                  key={po._id}
                  className="hover:bg-gray-50 transition-colors duration-200 border-b"
                >
                  <td className="px-5 py-3 text-[#7E63F4] font-medium">
                    <Link
                      to={`/current-purchase-order/${po._id}`}
                      className="hover:underline"
                    >
                      {po?.supplierName}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    {po?.supplierPhone}
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    <span className="flex justify-start items-center font-semibold">
                      <MdCurrencyRupee />
                      {po?.billingAmount}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    {po?.purchaseOrderNumber}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    <p>{formatDateString(po?.purchaseOrderDate)}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    <p>
                      {po.status === "Delivered" ? (
                        <span className="bg-green-100 text-center w-fit p-1 font-bold text-green-700 text-xs select-none">
                          {po.status}
                        </span>
                      ) : po.status === "Cancelled" ? (
                        <span className="bg-red-100 text-center w-fit p-1 font-bold text-red-700 text-xs select-none">
                          {po.status}
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-center w-fit p-1 font-bold text-yellow-700 text-xs select-none">
                          {po.status}
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
                  No purchase orders found.
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
            <PurchaseOrderForm onCancel={() => setIsActive(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoadingUI(PurchaseOrders);
