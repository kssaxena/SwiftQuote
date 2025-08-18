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

const DashboardHome = ({ startLoading, stopLoading }) => {
  const dispatch = useDispatch();
  const [isActive, setIsActive] = useState(false);
  const user = useSelector((store) => store.UserInfo.user[0]);
  const { invoices, loading, error } = useSelector((state) => state.Invoices);
  useEffect(() => {
    // startLoading();
    if (user?._id) {
      dispatch(fetchInvoices(user._id));
    }
    // stopLoading();
  }, [user, dispatch]);
  const TableHeaders = [
    "Client",
    "Contact Number",
    "Amount",
    "Invoice No #",
    "Invoice Date",
    "Payment Status",
  ];
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
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white px-6 py-10 md:px-12 text-gray-800">
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
          label="Clients"
          value="36"
          color="text-[#7E63F4]"
        />
        <StatCard
          icon={<FaWallet />}
          label="Revenue"
          value={
            <h1 className="flex justify-center items-center">
              <MdCurrencyRupee />
              {totalBillingAmount.toFixed(2)}
            </h1>
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

      {/* Quick Actions */}
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
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
        <div className="overflow-x-auto bg-gray-50 rounded-lg shadow-sm">
          <table className="w-full text-sm text-left bg-white rounded-xl shadow-sm overflow-hidden">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                {TableHeaders.map((header, index) => (
                  <th
                    key={index}
                    className="px-5 py-3 font-medium tracking-wide"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                invoices.slice(0, 2).map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="hover:bg-gray-50 transition-colors duration-200 border-b"
                  >
                    <td className="px-5 py-3 text-[#7E63F4] font-medium">
                      <Link
                        to={`/current-invoice/${invoice._id}`}
                        className="hover:underline"
                      >
                        {invoice?.customerName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {invoice?.customerPhone}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      <span className="flex justify-start items-center font-semibold">
                        <MdCurrencyRupee />
                        {invoice?.billingAmount}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {invoice?.invoiceNumber}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      <p>{new Date(invoice?.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs">
                        {new Date(invoice?.createdAt).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      <p>
                        {invoice.dueAmount === 0 ? (
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

export default LoadingUI(DashboardHome);
