import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchQuotationById,
  updateQuotation,
} from "../../utils/slice/QuotationSlice";
import InputBox from "../../components/Input";
import Button from "../../components/Button";
import LoadingUI from "../../components/LoadingUI";
import { useReactToPrint } from "react-to-print";
import { FetchData } from "../../utils/FetchFromApi";

const CurrentQuotation = ({ startLoading, stopLoading }) => {
  const { quotationId } = useParams();
  const dispatch = useDispatch();
  const quotation = useSelector((state) => state.Quotation.currentQuotation);
  const user = useSelector((store) => store.UserInfo.user[0]);

  const formRef = useRef();
  const contentRef = useRef(); // 👈 for print
  const [isEditOpen, setIsEditOpen] = useState(false);

  // ---------- Local edit state ----------
  const [formData, setFormData] = useState({
    customerName: "",
    customerAddress: "",
    customerPhone: "",
    customerGST: "",
    customerState: "",
    quotationNumber: "",
    quotationFromDate: "",
    quotationUptoDate: "",
    subject: "",
    status: "",
  });
  const [items, setItems] = useState([]);

  // ---------- Helpers ----------
  const formatDateForInput = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const initializeEditState = (q) => {
    setFormData({
      customerName: q?.customerName || "",
      customerAddress: q?.customerAddress || "",
      customerPhone: q?.customerPhone || "",
      customerGST: q?.customerGST || "",
      customerState: q?.customerState || "",
      quotationNumber: q?.quotationNumber || "",
      quotationFromDate: q?.quotationFromDate
        ? formatDateForInput(q.quotationFromDate)
        : "",
      quotationUptoDate: q?.quotationUptoDate
        ? formatDateForInput(q.quotationUptoDate)
        : "",
      subject: q?.subject || "",
      status: q?.status || "Draft",
    });
    setItems(
      (q?.items || []).map((it) => ({
        description: it.description || "",
        size: it.size || "",
        qty: Number(it.qty || 0),
        color: it.color || "",
        rate: Number(it.rate || 0),
        amount: Number(it.amount || 0),
      }))
    );
  };

  useEffect(() => {
    if (quotationId) {
      startLoading();
      dispatch(fetchQuotationById(quotationId)).finally(() => stopLoading());
    }
  }, [quotationId, dispatch]);

  useEffect(() => {
    if (isEditOpen && quotation) initializeEditState(quotation);
  }, [isEditOpen, quotation]);

  // ---------- Handlers ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      const v = field === "qty" || field === "rate" ? Number(value) : value;
      next[index][field] = v;
      if (field === "qty" || field === "rate") {
        const qty = Number(next[index].qty || 0);
        const rate = Number(next[index].rate || 0);
        next[index].amount = qty * rate;
      }
      return next;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { description: "", size: "", color: "", qty: 1, rate: 0, amount: 0 },
    ]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const openEdit = () => setIsEditOpen(true);

  const handleUpdateQuotation = async (e) => {
    e.preventDefault();
    try {
      startLoading();
      const fd = new FormData(formRef.current);
      fd.append("items", JSON.stringify(items));

      await dispatch(
        updateQuotation({ quotationId, userId: user?.id, formData: fd })
      );
      alert("Quotation Updated Successfully");
      setIsEditOpen(false);
    } catch (err) {
      console.log(err);
    } finally {
      stopLoading();
    }
  };

  // ---------- Print Setup ----------
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `Quotation-${quotation?.quotationNumber || quotationId}`,
  });
  const handleDownloadStatus = async () => {
    try {
      startLoading();
      const response = await FetchData(
        `users/update-quotation-status/${quotationId}`,
        "post"
      );
      console.log(response);
    } catch (err) {
      console.log(err);
    } finally {
      stopLoading();
      reactToPrintFn();
    }
  };

  // ---------- Render ----------
  if (!quotation || !user) {
    return <div className="p-10 text-gray-500">Loading Quotation...</div>;
  }

  return (
    <div className="py-20 w-full">
      <div className="flex flex-col justify-center items-center gap-5 py-5">
        <div className="flex justify-start items-center w-[90%] gap-5">
          <h2 className="text-xl font-semibold">Quotation Id: {quotationId}</h2>
          <Button Label="Print" onClick={handleDownloadStatus} />{" "}
          {/* 👈 Print button */}
          <Button Label="Edit" onClick={openEdit} />
        </div>

        {/* ---- Quotation Content (Display Mode) ---- */}
        <div
          ref={contentRef} // 👈 printable content
          className="flex flex-col p-4 mt-10 w-[95%] mx-auto text-xs"
        >
          <h1 className="text-2xl font-bold text-center">Quotation</h1>
          <p className="text-center">
            <strong>Quotation No:</strong> {quotation.quotationNumber}
          </p>
          <img
            src={user?.image[0]?.url}
            alt={user?.businessName}
            className="w-14 h-14 rounded-full shadow-lg "
          />
          <strong>from</strong>
          <h2 className="font-semibold">{user.businessName}</h2>
          <p>
            {user.businessAddress} | <strong>State</strong>:{" "}
            {user.businessState}
          </p>
          <p>
            <strong>GSTIN</strong>: {user.gstNumber}
          </p>
          <p>
            <strong>Phone</strong>: {user.businessContact} |{" "}
            <strong>Email</strong>: {user.businessEmail}
          </p>
          <div className="py-6">
            <p>
              <strong>Valid from (MMDDYY):</strong>{" "}
              {new Date(quotation.createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Valid Upto (MMDDYY):</strong>{" "}
              {new Date(quotation.quotationUptoDate).toLocaleDateString()}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p>
                <strong>To:</strong> {quotation.customerName}
              </p>
              <p>
                <strong>Address</strong>: {""}
                {quotation.customerAddress}
              </p>
              <p>
                <strong>Phone</strong>: {quotation.customerPhone}
              </p>
              <p>
                <strong>GST</strong>: {quotation.customerGST || "N/a"}
              </p>
              <p>
                <strong>State</strong>: {quotation.customerState}
              </p>
            </div>
            {/* <div className="text-right">
              <p>
                <strong>Quotation No:</strong> {quotation.quotationNumber}
              </p>
              <p>
                <strong>Valid from (MMDDYY):</strong>{" "}
                {new Date(quotation.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Valid Upto (MMDDYY):</strong>{" "}
                {new Date(quotation.quotationUptoDate).toLocaleDateString()}
              </p>
            </div> */}
          </div>
          <h3 className="text-lg py-5">
            <strong>Subject</strong>: {quotation.subject}
          </h3>
          <h1>Dear Sir/Ma'am,</h1>
          <p className="indent-8">
            {user?.quotationPara ||
              "We express our intent to supply for your requirements. Our products are manufactured in state-of-the-art facilities using advanced technology and premium quality materials. The offering includes a wide range of models and specifications suitable for residential, commercial, and industrial purposes, along with standard accessories, delivery, and installation support."}
          </p>
          <table className="w-full border-collapse border text-xs mt-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-1">Sl No.</th>
                <th className="border p-1">Description</th>
                <th className="border p-1">Color</th>
                <th className="border p-1">Qty</th>
                <th className="border p-1">Size</th>
                <th className="border p-1">Rate</th>
                <th className="border p-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item, index) => (
                <tr key={index}>
                  <td className="border p-1 text-center">{index + 1}</td>
                  <td className="border p-1">{item.description}</td>
                  <td className="border p-1 text-center">{item.color}</td>
                  <td className="border p-1 text-center">{item.qty}</td>
                  <td className="border p-1 text-center">{item.size}</td>
                  <td className="border p-1 text-center">{item.rate}</td>
                  <td className="border p-1 text-right">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <h1>
              {quotation.items.map((item, index) => (
                <p key={index}>
                  <strong>Total Payable</strong>:{item.amount}
                </p>
              ))}
            </h1>
          </div>
          {/* Terms & Conditions */}
          <div className="mt-4">
            <h3 className="font-bold">Terms & Conditions</h3>
            <ul className="list-disc list-inside">
              {user?.termsAndConditions?.descriptions?.map((term, i) => (
                <li key={i}>{term}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2 py-4">
            <h1>
              Thank you for considering <strong>{user?.businessName}</strong>.
              Please feel free to reach out for further details or to confirm
              your order.
            </h1>
            <p>Best regards</p>
            <p>
              {user?.businessName} | {user?.businessContact}
            </p>
          </div>
          <div className=" w-fit px-5 py-2 rounded-lg shadow-lg">
            <h1>Banking Details</h1>
            <p>
              <strong>Bank Name</strong>:{user?.bankDetails?.bankName || "N/A"}
            </p>
            <p>
              <strong>Branch Name</strong>:
              {user?.bankDetails?.branchName || "N/A"}
            </p>
            <p>
              <strong>Account Name</strong>:
              {user?.bankDetails?.accountHolderName || "N/A"}
            </p>
            <p>
              <strong>Account Number</strong>:
              {user?.bankDetails?.accountNumber || "N/A"}
            </p>
            <p>
              <strong>IFSC Code</strong>:{user?.bankDetails?.ifscCode || "N/A"}
            </p>
            <p>
              <strong>UPI Code</strong>:{user?.bankDetails?.upiId || "N/A"}
            </p>
          </div>
          <footer className="print-footer ">
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
              generated invoice
            </div>
          </footer>
        </div>

        {/* ---- Edit Modal ---- */}
        {isEditOpen && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-start overflow-scroll no-scrollbar z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[95%] max-w-4xl">
              <h2 className="text-lg font-semibold mb-4">Edit Quotation</h2>

              <form
                ref={formRef}
                onSubmit={handleUpdateQuotation}
                className="space-y-6"
              >
                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                  <InputBox
                    LabelName="Customer Name"
                    Name="customerName"
                    Type="text"
                    Value={formData.customerName}
                    onChange={handleChange}
                  />
                  <InputBox
                    LabelName="Customer Address"
                    Name="customerAddress"
                    Type="text"
                    Value={formData.customerAddress}
                    onChange={handleChange}
                  />
                  <InputBox
                    LabelName="Phone Number"
                    Name="customerPhone"
                    Type="number"
                    Value={formData.customerPhone}
                    onChange={handleChange}
                  />
                  <InputBox
                    LabelName="GST Number"
                    Name="customerGST"
                    Type="text"
                    Value={formData.customerGST}
                    onChange={handleChange}
                  />
                  <InputBox
                    LabelName="State"
                    Name="customerState"
                    Type="text"
                    Value={formData.customerState}
                    onChange={handleChange}
                  />
                </div>

                {/* Quotation Details */}
                <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                  <InputBox
                    LabelName="Quotation Number"
                    Name="quotationNumber"
                    Type="text"
                    Value={formData.quotationNumber}
                    onChange={handleChange}
                  />
                  <InputBox
                    LabelName="From Date"
                    Name="quotationFromDate"
                    Type="date"
                    Value={formData.quotationFromDate}
                    onChange={handleChange}
                  />
                  <InputBox
                    LabelName="Valid Upto Date"
                    Name="quotationUptoDate"
                    Type="date"
                    Value={formData.quotationUptoDate}
                    onChange={handleChange}
                  />
                  <InputBox
                    LabelName="Subject"
                    Name="subject"
                    Type="text"
                    Value={formData.subject}
                    onChange={handleChange}
                  />
                  <InputBox
                    LabelName="Status"
                    Name="status"
                    Type="text"
                    Value={formData.status}
                    onChange={handleChange}
                  />
                </div>

                {/* Items */}
                <div className="border p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">
                    Quotation Items
                  </h3>
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 p-3 rounded-lg mb-3"
                    >
                      <InputBox
                        LabelName="Description"
                        Name={`description-${index}`}
                        Type="text"
                        Value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <InputBox
                          LabelName="Size"
                          Name={`size-${index}`}
                          Type="text"
                          Value={item.size}
                          onChange={(e) =>
                            handleItemChange(index, "size", e.target.value)
                          }
                        />
                        <InputBox
                          LabelName="Qty"
                          Name={`qty-${index}`}
                          Type="number"
                          Value={item.qty}
                          onChange={(e) =>
                            handleItemChange(index, "qty", e.target.value)
                          }
                        />
                        <InputBox
                          LabelName="Rate"
                          Name={`rate-${index}`}
                          Type="number"
                          Value={item.rate}
                          onChange={(e) =>
                            handleItemChange(index, "rate", e.target.value)
                          }
                        />
                      </div>
                      <InputBox
                        LabelName="Color"
                        Name={`color-${index}`}
                        Type="text"
                        Value={item.color}
                        onChange={(e) =>
                          handleItemChange(index, "color", e.target.value)
                        }
                      />
                      <InputBox
                        LabelName="Amount"
                        Name={`amount-${index}`}
                        Type="number"
                        Value={item.amount}
                        DisableRequired={true}
                      />
                      <Button
                        Label="✕ Remove"
                        onClick={() => removeItem(index)}
                        className="hover:bg-red-600 mt-2"
                        type="button"
                      />
                    </div>
                  ))}
                  <Button Label="+ Add Item" onClick={addItem} type="button" />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    Label="Cancel"
                    onClick={() => setIsEditOpen(false)}
                    className="bg-gray-400 hover:bg-gray-500"
                    type="button"
                  />
                  <Button Label="Save Changes" type="submit" />
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingUI(CurrentQuotation);
