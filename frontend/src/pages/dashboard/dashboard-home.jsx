import React, { useEffect, useState } from "react";
import {
  FaFileInvoiceDollar,
  FaUsers,
  FaWallet,
  FaPlus,
  FaFileInvoice,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import InputBox from "../../components/Input";
import { Link } from "react-router-dom";
import { MdCurrencyRupee } from "react-icons/md";
import Button from "../../components/Button";
import { AnimatePresence, motion } from "framer-motion";
import Bill_form from "../bill-main/bill-form";
import LoadingUI from "../../components/LoadingUI";
import { fetchInvoices } from "../../utils/slice/InvoiceSlice";
import { fetchEstimates } from "../../utils/slice/EstimateSlice";
import EstimateForm from "../estimates/estimate-form";
import QuotationForm from "../quotations/quotation-form";
import RecentInvoice from "./recent-invoice";
import RecentEstimate from "./recent-estimate";

const DashboardHome = ({ startLoading, stopLoading }) => {
  const dispatch = useDispatch();
  const [isActive, setIsActive] = useState(false);
  const [isActive2, setIsActive2] = useState(false);
  const [isActive3, setIsActive3] = useState(false);
  const user = useSelector((store) => store.UserInfo.user[0]);
  const { invoices, loading, error } = useSelector((state) => state.Invoices);
  const { estimates } = useSelector((state) => state.Estimates);
  useEffect(() => {
    stopLoading();
    if (user?._id) {
      dispatch(fetchInvoices(user._id));
      dispatch(fetchEstimates(user._id));
    } else {
      startLoading();
  }
  }, [user, dispatch]);
  const totalBillingAmount = invoices.reduce(
    (acc, invoice) => acc + (invoice.billingAmount || 0),
    0
  );

  const totalDueAmount = invoices.reduce(
    (acc, invoice) => acc + (invoice.dueAmount || 0),
    0
  );

  const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-gray-50 p-5 rounded-lg shadow-sm flex items-center space-x-4">
      <div className={`text-2xl ${color}`}>{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="bg-white px-6 py-10 md:px-12 text-gray-800 h-full overflow-scroll">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-1">Welcome back 👋</h1>
        <p className="text-gray-500">
          Here's a quick overview of your billing activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          icon={<FaFileInvoice />}
          label="Total Invoices"
          value={invoices?.length}
          color="text-[#7E63F4]"
        />
        <StatCard
          icon={<FaUsers />}
          label="Estimates"
          value={estimates?.length}
          // value="36"
          color="text-[#7E63F4]"
        />
        <StatCard
          icon={<FaWallet />}
          label="Revenue"
          value={
            <p className="flex justify-center items-center">
              <MdCurrencyRupee />
              {totalBillingAmount.toFixed(2)}
            </p>
          }
          color="text-[#7E63F4]"
        />
        <StatCard
          icon={<FaFileInvoice />}
          label="Pending"
          value={
            <h1 className="flex justify-center items-center">
              <MdCurrencyRupee />
              {totalDueAmount.toFixed(2)}
            </h1>
          }
          color="text-red-500"
        />
      </div>

      {/* Quick Actions buttons */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
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
          <Button
            Label={
              <h1 className="flex justify-center items-center gap-2">
                {<FaPlus />}New Quotation
              </h1>
            }
            onClick={() => setIsActive3(true)}
          />
        </div>
      </div>

      {/* Recent Invoices */}
      <RecentInvoice />
      {/* Recent Estimates */}
      <RecentEstimate />
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
        {isActive3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed h-screen w-screen top-0 left-0 bg-white lg:p-20 p-5 z-20 overflow-auto no-scrollbar"
          >
            <QuotationForm onCancel={() => setIsActive3(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoadingUI(DashboardHome);
