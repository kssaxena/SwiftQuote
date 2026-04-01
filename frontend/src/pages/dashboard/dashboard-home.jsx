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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
    0,
  );

  const totalDueAmount = invoices.reduce(
    (acc, invoice) => acc + (invoice.dueAmount || 0),
    0,
  );

  // Calculate monthly revenue across all years
  const calculateMonthlyRevenue = () => {
    const monthlyData = {};
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Sum up billingAmount for each month-year
    invoices.forEach((invoice) => {
      if (invoice.invoiceDate) {
        const date = new Date(invoice.invoiceDate);
        const year = date.getFullYear();
        const month = date.getMonth(); // Store as number (0-11)
        const monthName = monthNames[month];
        const key = `${monthName} ${year}`;

        monthlyData[key] = {
          revenue:
            (monthlyData[key]?.revenue || 0) + (invoice.billingAmount || 0),
          sortDate: new Date(year, month, 1), // Create proper date for sorting
        };
      }
    });

    // Convert to array and sort by date from oldest to newest
    const sortedData = Object.entries(monthlyData)
      .map(([key, data]) => ({
        name: key,
        revenue: data.revenue,
        sortDate: data.sortDate,
      }))
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());

    // Return only name and revenue for chart
    return sortedData.map(({ name, revenue }) => ({
      name,
      revenue,
    }));
  };

  const monthlyRevenueData = calculateMonthlyRevenue();

  // Calculate yearly revenue
  const calculateYearlyRevenue = (year) => {
    return invoices.reduce((total, invoice) => {
      if (invoice.invoiceDate) {
        const date = new Date(invoice.invoiceDate);
        if (date.getFullYear() === year) {
          return total + (invoice.billingAmount || 0);
        }
      }
      return total;
    }, 0);
  };

  // Calculate yearly pending/due amounts
  const calculateYearlyPending = (year) => {
    return invoices.reduce((total, invoice) => {
      if (invoice.invoiceDate) {
        const date = new Date(invoice.invoiceDate);
        if (date.getFullYear() === year) {
          return total + (invoice.dueAmount || 0);
        }
      }
      return total;
    }, 0);
  };

  const revenue2025 = calculateYearlyRevenue(2025);
  const revenue2026 = calculateYearlyRevenue(2026);
  const pending2025 = calculateYearlyPending(2025);
  const pending2026 = calculateYearlyPending(2026);

  // Prepare ledger chart data
  const ledgerChartData = [
    {
      year: "2025",
      revenue: revenue2025,
      pending: pending2025,
    },
    {
      year: "2026",
      revenue: revenue2026,
      pending: pending2026,
    },
  ];

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
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-semibold mb-1">Welcome back 👋</h1>
        <p className="text-gray-500">
          Here's a quick overview of your billing activity.
        </p>
      </div>

      <div className="flex justify-between items-between gap-5">
        <div>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 w-3/4">
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
              label="Total Revenue"
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
          <div className="flex flex-col ">
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
        </div>

        {/* Yearly Revenue & Pending Ledger Chart */}
        <div className="mb-12 w-[40vw]">
          <h2 className="text-xl font-semibold mb-4">Ledger Summary</h2>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={ledgerChartData}
                margin={{ top: 20, right: 20, left: 40, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => `₹${value.toFixed(2)}`}
                  labelStyle={{ color: "#000" }}
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill="#7E63F4"
                  name="Revenue"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="pending"
                  fill="#EF4444"
                  name="Pending"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bar graph */}
      <div className="mb-12 hidden lg:block w-[70vw]">
        <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>

        <div className="bg-gray-50 p-6 rounded-lg shadow-sm overflow-x-auto">
          <div style={{ minWidth: `${monthlyRevenueData.length * 80}px` }}>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={monthlyRevenueData}
                margin={{ top: 20, right: 20, left: 40, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  interval={0}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => `₹${value.toFixed(2)}`}
                  labelStyle={{ color: "#000" }}
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill="#7E63F4"
                  name="Revenue"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
