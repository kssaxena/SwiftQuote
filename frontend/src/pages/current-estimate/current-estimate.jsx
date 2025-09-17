import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchEstimateById,
  updateEstimate,
} from "../../utils/slice/EstimateSlice";
import { useReactToPrint } from "react-to-print";
import Button from "../../components/Button";
import InputBox from "../../components/Input";
import { FetchData } from "../../utils/FetchFromApi";

const CurrentEstimate = () => {
  const { estimateId } = useParams();
  const dispatch = useDispatch();
  const { currentEstimate, loading } = useSelector((state) => state.Estimates);
  const user = useSelector((store) => store.UserInfo.user[0]);
  // const [bankDetail, setBankDetail] = useState(user);
  const bankDetail = user?.bankDetails;
  console.log(bankDetail);
  const contentRef = useRef();
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({});

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `Estimate-${currentEstimate?.estimateNumber}`,
  });

  useEffect(() => {
    if (estimateId) {
      dispatch(fetchEstimateById(estimateId));
    }
  }, [estimateId, dispatch]);

  useEffect(() => {
    if (currentEstimate) setEditValues(currentEstimate);
  }, [currentEstimate]);

  const handleUpdate = () => {
    const formData = new FormData();
    Object.keys(editValues).forEach((key) => {
      if (key !== "items") formData.append(key, editValues[key]);
    });
    formData.append("items", JSON.stringify(editValues.items));
    dispatch(updateEstimate({ estimateId, formData }));
    setIsEditing(false);
  };

  // useEffect(() => {
  //   const getBankDetails = async () => {
  //     try {
  //       // startLoading();
  //       const response = await FetchData(
  //         `users/get-bank-detail/${user[0]?._id}`,
  //         "get"
  //       );
  //       setBankDetail(response.data.data);
  //       // alert("Details fetched successfully !");
  //     } catch (err) {
  //       // console.log(err);
  //     }
  //   };

  //   getBankDetails();
  // }, [user]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="py-20 w-full px-20">
      {/* ---------- Top Controls ---------- */}
      <div className="flex justify-between items-center px-6 py-5">
        <h2 className="text-xl font-semibold">
          Estimate #{currentEstimate?.estimateNumber}
        </h2>
        <div className="flex gap-3">
          <Button Label="Print" onClick={reactToPrintFn} />
          <Button
            Label={isEditing ? "Cancel" : "Edit"}
            onClick={() => setIsEditing(!isEditing)}
          />
          {isEditing && <Button Label="Save" onClick={handleUpdate} />}
        </div>
      </div>

      {/* ---------- Printable Invoice ---------- */}
      <div
        ref={contentRef}
        className="bg-white  rounded-lg p-6 mt-6 text-xs "
      >
        {/* ---------- Header ---------- */}
        <header className="border-b pb-4 text-center border p-2 rounded-xl">
          <div>
            <img src={user?.image[0]?.url} className="w-10 rounded-full" />
            <h1 className="text-2xl font-bold uppercase">Estimate Invoice</h1>
          </div>
          <h2 className=" font-semibold mt-2">{user?.businessName}</h2>
          <p>
            {user?.businessAddress}, {user?.businessState}
          </p>
          <p>GSTIN: {user?.gstNumber}</p>
          <p>
            Phone: {user?.businessContact} | Email: {user?.businessEmail}
          </p>

          <div className="grid grid-cols-2 gap-6 mt-4 text-left">
            <div>
              <p className="border-b">
                <strong>Estimate No.:</strong> {currentEstimate?.estimateNumber}
              </p>
              <p className="border-b">
                <strong>Dated:</strong>{" "}
                {new Date(currentEstimate?.estimateDate).toLocaleDateString()}
              </p>
              <p className="border-b">
                <strong>Valid Until:</strong>{" "}
                {new Date(currentEstimate?.validUntil).toLocaleDateString()}
              </p>
              <p className="border-b">
                <strong>Reference No.:</strong> {currentEstimate?.referenceNo}
              </p>
              <p className="border-b">
                <strong>Buyer’s Order No.:</strong>{" "}
                {currentEstimate?.buyerOrderNo}
              </p>
            </div>
            <div>
              <p className="border-b">
                <strong>Dispatch Doc No.:</strong>{" "}
                {currentEstimate?.dispatchDocNo}
              </p>
              <p className="border-b">
                <strong>Delivery Note:</strong> {currentEstimate?.deliveryNote}
              </p>
              <p className="border-b">
                <strong>Destination:</strong> {currentEstimate?.destination}
              </p>
              <p>
                <strong>Payment Terms:</strong> {currentEstimate?.paymentTerms}
              </p>
            </div>
          </div>
        </header>

        {/* ---------- Customer Details ---------- */}
        <section className="border-b grid grid-cols-2 gap-6 mt-4">
          <div>
            <h3 className="font-semibold border-b">Customer (Bill To)</h3>
            <p className="border-b">
              <strong>{currentEstimate?.customerName}</strong>
            </p>
            <p className="border-b">{currentEstimate?.customerAddress}</p>
            <p className="border-b">Phone: {currentEstimate?.customerPhone}</p>
            <p className="border-b">State: {currentEstimate?.customerState}</p>
            <p>GST: {currentEstimate?.customerGST}</p>
          </div>
          <div>
            <h3 className="font-semibold border-b">Consignee (Ship To)</h3>
            <p className="border-b">
              <strong>{currentEstimate?.customerName}</strong>
            </p>
            <p className="border-b">{currentEstimate?.customerAddress}</p>
            <p className="border-b">Phone: {currentEstimate?.customerPhone}</p>
            <p className="border-b">State: {currentEstimate?.customerState}</p>
            <p>GST: {currentEstimate?.customerGST}</p>
          </div>
        </section>

        {/* ---------- Items Table ---------- */}
        <section className="mt-4">
          <h3 className=" font-semibold mb-2">Description of Goods</h3>
          <table className="w-full border-collapse border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">#</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Qty</th>
                <th className="border p-2">Rate</th>
                <th className="border p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentEstimate?.items?.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">{item.description}</td>
                  <td className="border p-2 text-center">{item.qty}</td>
                  <td className="border p-2 text-center">{item.rate}</td>
                  <td className="border p-2 text-right">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ---------- Tax & Summary ---------- */}
        <section className="flex justify-end mt-2">
          <div className="w-1/2 border rounded-lg p-4 ">
            <div className="flex justify-between border-b">
              <span>Taxable Value</span>{" "}
              <span>{currentEstimate?.taxableValue}</span>
            </div>
            <div className="flex justify-between border-b">
              <span>SGST</span> <span>{currentEstimate?.sgst}</span>
            </div>
            <div className="flex justify-between border-b">
              <span>CGST</span> <span>{currentEstimate?.cgst}</span>
            </div>
            <div className="flex justify-between border-b">
              <span>Total Tax</span> <span>{currentEstimate?.totalTax}</span>
            </div>
            <div className="flex justify-between font-semibold border-b">
              <span>Total (incl. tax)</span>{" "}
              <span>{currentEstimate?.billingAmount}</span>
            </div>
            <div className="flex justify-between border-b">
              <span>Amount Received</span>{" "}
              <span>{currentEstimate?.receivedAmount}</span>
            </div>
            <div className="flex justify-between ">
              <span>Due Amount</span> <span>{currentEstimate?.dueAmount}</span>
            </div>
          </div>
        </section>

        {/* ---------- T&C ---------- */}
        <div className="mt-6 ">
          <p>
            <strong>Declaration:</strong> This is a system-generated estimate.
            Prices are indicative and valid until{" "}
            {new Date(currentEstimate?.validUntil).toLocaleDateString()}.
          </p>
          <div className="mt-6 flex justify-between">
            <div>
              <p className="text-xs">
                Terms & Conditions: <br />
              </p>
              <ul>
                {user?.termsAndConditions?.descriptions?.map((item, index) => (
                  <li
                    key={index}
                    className="text-xs text-gray-700 flex gap-2 items-start"
                  >
                    <span className="font-medium text-gray-600">
                      {index + 1}.
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-right">
              <p>for {user?.businessName}</p>
              <p className="mt-10">Authorised Signatory</p>
            </div>
          </div>
        </div>
        {/* footer  */}
        <footer className="print-footer border-t">
          <div className="mt-2 text-[8px] flex justify-center items-center ">
            This is a{" "}
            <span>
              <h1 className="bg-white text-black/80 font-bold p-2 rounded-xl select-none w-fit  tracking-normal">
                Swift{" "}
                <span className="color-purple text-white p-1 rounded-xl">
                  Quote
                </span>
              </h1>
            </span>{" "}
            generated Estimate
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CurrentEstimate;
