import React, { useEffect } from "react";
import LoadingUI from "../../components/LoadingUI";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvoices } from "../../utils/slice/InvoiceSlice";
import { Link } from "react-router-dom";
import { MdCurrencyRupee } from "react-icons/md";

const RecentInvoice = ({ startLoading, stopLoading }) => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.UserInfo.user[0]);
  const { invoices, loading, error } = useSelector((state) => state.Invoices);
  useEffect(() => {
    stopLoading();
    if (user?._id) {
      dispatch(fetchInvoices(user._id));
      //   dispatch(fetchEstimates(user._id));
    } else {
      startLoading();
    }
  }, [user, dispatch]);
  const TableHeaders = [
    "Client",
    "Contact Number",
    "Amount",
    "Invoice No #",
    "Creation Date",
    "Payment Status",
  ];
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
      <div className="overflow-x-auto bg-gray-50 rounded-lg shadow-sm">
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
                    {/* <p className="text-xs">
                      {new Date(invoice?.createdAt).toLocaleTimeString()}
                    </p> */}
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
  );
};

export default LoadingUI(RecentInvoice);
