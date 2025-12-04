import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchInvoiceById,
  updateInvoice,
} from "../../utils/slice/InvoiceSlice";
import InputBox from "../../components/Input";
import Button from "../../components/Button";
import { useReactToPrint } from "react-to-print";
import LoadingUI from "../../components/LoadingUI";
import numberToWords from "number-to-words";
import { FetchData } from "../../utils/FetchFromApi";

const sgstRate = 9;
const cgstRate = 9;

const CurrentInvoice = ({ startLoading, stopLoading }) => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.UserInfo.user[0]);
  const userId = user?._id;
  const { currentInvoice } = useSelector((state) => state.Invoices);

  const contentRef = useRef();
  const formRef = useRef();

  const [isEditOpen, setIsEditOpen] = useState(false);

  // ---------- Local edit state ----------
  const [formData, setFormData] = useState({
    customerName: "",
    customerAddress: "",
    customerPhone: "",
    customerGST: "",
    customerState: "",
    invoiceNumber: "",
    invoiceDate: "",
    referenceNo: "",
    buyerOrderNo: "",
    dispatchDocNo: "",
    deliveryNote: "",
    destination: "",
    paymentTerms: "",
    billingAmount: "",
    receivedAmount: "",
    discount: 0,
    disBillAmount: 0,
  });

  const [items, setItems] = useState([]);

  const formatDateForInput = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const initializeEditState = (inv) => {
    setFormData({
      customerName: inv?.customerName || "",
      customerAddress: inv?.customerAddress || "",
      customerPhone: inv?.customerPhone || "",
      customerGST: inv?.customerGST || "",
      customerState: inv?.customerState || "",
      invoiceNumber: inv?.invoiceNumber || "",
      invoiceDate: formatDateForInput(inv?.invoiceDate),
      referenceNo: inv?.referenceNo || "",
      buyerOrderNo: inv?.buyerOrderNo || "",
      dispatchDocNo: inv?.dispatchDocNo || "",
      deliveryNote: inv?.deliveryNote || "",
      destination: inv?.destination || "",
      paymentTerms: inv?.paymentTerms || "",
      billingAmount: inv?.billingAmount ?? "",
      receivedAmount: inv?.receivedAmount ?? "",
      discount: inv?.discount ?? 0,
      disBillAmount: inv?.disBillAmount ?? inv?.billingAmount,
    });

    setItems(
      inv?.items?.map((it) => ({
        description: it.description || "",
        size: it.size || "",
        qty: Number(it.qty || 0),
        color: it.color || "",
        rate: Number(it.rate || 0),
        amount: Number(it.amount || 0),
      })) || []
    );
  };

  const safeInvoiceNumber = currentInvoice?.invoiceNumber?.replace(
    /[\/:]/g,
    "-"
  );

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `Invoice-${safeInvoiceNumber}`,
  });

  useEffect(() => {
    if (invoiceId) dispatch(fetchInvoiceById(invoiceId));
  }, [invoiceId]);

  useEffect(() => {
    if (isEditOpen && currentInvoice) initializeEditState(currentInvoice);
  }, [isEditOpen, currentInvoice]);

  // ---------- TAX CALCULATIONS ----------
  const numbers = useMemo(() => {
    const billing = Number(formData.billingAmount || 0);
    const discount = Number(formData.discount || 0);
    const received = Number(formData.receivedAmount || 0);

    const afterDiscount = billing - discount;
    const totalRate = sgstRate + cgstRate;

    const taxableValue =
      totalRate > 0 ? afterDiscount / (1 + totalRate / 100) : afterDiscount;

    const sgst = (taxableValue * sgstRate) / 100;
    const cgst = (taxableValue * cgstRate) / 100;
    const totalTax = sgst + cgst;
    const dueAmount = afterDiscount - received;

    return {
      billing,
      discount,
      afterDiscount,
      taxableValue,
      sgst,
      cgst,
      totalTax,
      dueAmount,
    };
  }, [formData.billingAmount, formData.discount, formData.receivedAmount]);

  // ---------- CHANGE HANDLERS ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      const v = field === "qty" || field === "rate" ? Number(value) : value;
      next[index][field] = v;

      if (field === "qty" || field === "rate") {
        next[index].amount = Number(next[index].qty) * Number(next[index].rate);
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

  const handleUpdateInvoice = async (e) => {
    e.preventDefault();

    const fd = new FormData();

    Object.entries(formData).forEach(([key, val]) => {
      fd.append(key, val);
    });

    fd.append("items", JSON.stringify(items));

    fd.set("taxableValue", numbers.taxableValue.toFixed(2));
    fd.set("sgstValue", numbers.sgst.toFixed(2));
    fd.set("cgstValue", numbers.cgst.toFixed(2));
    fd.set("totalTax", numbers.totalTax.toFixed(2));
    fd.set("disBillAmount", numbers.afterDiscount.toFixed(2));
    fd.set("dueAmount", numbers.dueAmount.toFixed(2));

    await dispatch(updateInvoice({ invoiceId, formData: fd, userId }));
    alert("Updated Successfully");
    setIsEditOpen(false);
  };

  const handleDeleteInvoice = async () => {
    try {
      startLoading();
      const res = await FetchData(`users/delete-invoice/${invoiceId}`, "post");
      alert(res.data.data);
      navigate("/");
    } finally {
      stopLoading();
    }
  };

  const currentProducts = currentInvoice?.items;
  const words = numberToWords.toWords(
    currentInvoice?.disBillAmount || currentInvoice?.billingAmount || 0
  );

  // ------------------------------------------------------------------
  //                         RENDER STARTS HERE
  // ------------------------------------------------------------------

  return (
    <div className="py-20 w-full">
      {/* ---------- TOP ACTIONS (hidden on print) ---------- */}
      <div className="flex flex-col justify-center items-center gap-5 py-5 no-print">
        <div className="flex justify-start items-center w-[90%] gap-5">
          <h2 className="text-xl font-semibold">Invoice Id: {invoiceId}</h2>
          <Button Label="Print" onClick={reactToPrintFn} />
          <Button Label="Edit" onClick={() => setIsEditOpen(true)} />
          <Button Label="Delete" onClick={handleDeleteInvoice} />
        </div>
      </div>

      {/* ---------- PRINTABLE AREA ---------- */}
      <div
        ref={contentRef}
        className="bg-white text-black w-[95%] mx-auto p-4 shadow-lg rounded-lg text-xs"
      >
        {/* ---------- Header Section ---------- */}
        <header className="border-b py-2 px-1 text-center border no-break">
          <div>
            <img
              src={user?.image[0]?.url}
              className="w-10 rounded-full mx-auto"
            />
            <h1 className="text-2xl font-bold uppercase">Tax Invoice</h1>
          </div>
          <h2 className="font-semibold mt-2">{user?.businessName}</h2>
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
                <strong>Invoice No.: </strong>
                {currentInvoice?.invoiceNumber}
              </p>
              <p className="border-b">
                <strong>Dated: </strong>
                {new Date(currentInvoice?.invoiceDate).toLocaleDateString()}
              </p>
              <p className="border-b">
                <strong>Reference No: </strong>
                {currentInvoice?.referenceNo}
              </p>
              <p>
                <strong>Buyer Order No: </strong>
                {currentInvoice?.buyerOrderNo}
              </p>
            </div>
            <div>
              <p className="border-b">
                <strong>Dispatch Doc No: </strong>
                {currentInvoice?.dispatchDocNo}
              </p>
              <p className="border-b">
                <strong>Delivery Note: </strong>
                {currentInvoice?.deliveryNote}
              </p>
              <p className="border-b">
                <strong>Destination: </strong>
                {currentInvoice?.destination}
              </p>
              <p>
                <strong>Payment Terms: </strong>
                {currentInvoice?.paymentTerms}
              </p>
            </div>
          </div>
        </header>

        {/* ---------- Buyer / Consignee ---------- */}
        <section className="border py-2 px-1 grid grid-cols-2 gap-6 text-xs no-break">
          <div>
            <h3 className="font-semibold border-b">Buyer (Bill To)</h3>
            <p>
              <strong>Name:</strong>
              {"    "}
              {currentInvoice?.customerName}
            </p>
            <p>
              <strong>Address: </strong>
              {"    "}
              {currentInvoice?.customerAddress}
            </p>
            <p>
              <strong>Phone:</strong>
              {"    "} {currentInvoice?.customerPhone}
            </p>
            <p>
              <strong>GSTIN:</strong>
              {"    "} {currentInvoice?.customerGST}
            </p>
            <p>
              <strong>State:</strong>
              {"    "} {currentInvoice?.customerState}
            </p>
          </div>

          <div>
            <h3 className="font-semibold border-b">Consignee (Ship To)</h3>
            <p>
              <strong>Name:</strong>
              {"    "}
              {currentInvoice?.customerName}
            </p>
            <p>
              <strong>Address: </strong>
              {"    "}
              {currentInvoice?.customerAddress}
            </p>
            <p>
              <strong>Phone:</strong>
              {"    "} {currentInvoice?.customerPhone}
            </p>
            <p>
              <strong>GSTIN:</strong>
              {"    "} {currentInvoice?.customerGST}
            </p>
            <p>
              <strong>State:</strong>
              {"    "} {currentInvoice?.customerState}
            </p>
          </div>
        </section>

        {/* ---------- Items Table ---------- */}
        <section className="mt-4">
          <h3 className="font-semibold mb-2">Description of Goods</h3>

          <table className="w-full border-collapse border text-xs">
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
              {currentProducts?.map((item, index) => (
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
        </section>

        {/* ---------- Summary Section ---------- */}
        <section className="flex justify-end mt-4 no-break">
          <div className="w-1/2 border rounded-lg p-1 text-xs">
            <div className="flex justify-between border-b">
              <span>Taxable Value</span>
              <span>₹ {currentInvoice?.taxableValue}</span>
            </div>
            <div className="flex justify-between border-b">
              <span>SGST (9%)</span>
              <span>₹ {currentInvoice?.sgstValue}</span>
            </div>
            <div className="flex justify-between border-b">
              <span>CGST (9%)</span>
              <span>₹ {currentInvoice?.cgstValue}</span>
            </div>
            <div className="flex justify-between border-b">
              <span>Total Tax</span>
              <span>₹ {currentInvoice?.totalTax}</span>
            </div>
            {currentInvoice?.discount > 0 && (
              <div className="flex justify-between border-b">
                <span>Discount</span>
                <span>₹ {currentInvoice?.discount}</span>
              </div>
            )}
            <div className="flex justify-between border-b font-semibold">
              <span>Grand Total</span>
              <span>
                ₹{" "}
                {currentInvoice?.disBillAmount || currentInvoice?.billingAmount}
              </span>
            </div>
            <div className="flex justify-between border-b">
              <span>Advance Received</span>
              <span>₹ {currentInvoice?.receivedAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Due Amount</span>
              <span>₹ {currentInvoice?.dueAmount}</span>
            </div>
          </div>
        </section>

        {/* ---------- Signature + Declaration ---------- */}
        <section className="mt-6 text-xs no-break">
          <p>
            <strong>Amount in words:</strong>{" "}
            <span className="capitalize">{words} Rupees only.</span>
          </p>
          <p className="mt-2">
            <strong>Declaration:</strong> {"    "}We declare that this invoice
            shows the actual price of the goods described and all particulars
            are true.
          </p>

          <div className="mt-6 flex justify-between">
            <div>
              <p className="font-semibold">Terms & Conditions:</p>
              <ul>
                {user?.termsAndConditions?.descriptions?.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span>{i + 1}.</span> <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-right">
              <p>for {user?.businessName}</p>
              <p className="mt-10">Authorised Signatory</p>
            </div>
          </div>
        </section>
      </div>

      {/* ---------- PRINT FOOTER (Repeats on every page) ---------- */}
      <footer className="print-footer">
        <div className="text-[10px] flex justify-center items-center">
          This is
          <h1 className=" text-black/80 font-bold  p-2  select-none">
            Swift <span className="color-purple text-white p-1">Quote</span>
          </h1>
          generated invoice
        </div>
      </footer>

      {/* ---------- EDIT POPUP ---------- */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start overflow-scroll no-print z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[95%] max-w-4xl">
            <h2 className="text-lg font-semibold mb-4">Edit Invoice</h2>

            <form
              ref={formRef}
              onSubmit={handleUpdateInvoice}
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
                  LabelName="State Name & Code"
                  Name="customerState"
                  Type="text"
                  Value={formData.customerState}
                  onChange={handleChange}
                />
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                <InputBox
                  LabelName="Invoice Number"
                  Name="invoiceNumber"
                  Value={formData.invoiceNumber}
                  onChange={handleChange}
                />
                <InputBox
                  LabelName="Invoice Date"
                  Name="invoiceDate"
                  Type="date"
                  Value={formData.invoiceDate}
                  onChange={handleChange}
                />
                <InputBox
                  LabelName="Reference No."
                  Name="referenceNo"
                  Value={formData.referenceNo}
                  onChange={handleChange}
                />
                <InputBox
                  LabelName="Buyer's Order No."
                  Name="buyerOrderNo"
                  Value={formData.buyerOrderNo}
                  onChange={handleChange}
                />
                <InputBox
                  LabelName="Dispatch Document No."
                  Name="dispatchDocNo"
                  Value={formData.dispatchDocNo}
                  onChange={handleChange}
                />
                <InputBox
                  LabelName="Delivery Note"
                  Name="deliveryNote"
                  Value={formData.deliveryNote}
                  onChange={handleChange}
                />
                <InputBox
                  LabelName="Destination"
                  Name="destination"
                  Value={formData.destination}
                  onChange={handleChange}
                />
                <InputBox
                  LabelName="Payment Terms"
                  Name="paymentTerms"
                  Value={formData.paymentTerms}
                  onChange={handleChange}
                />
              </div>

              {/* Items */}
              <div className="border p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Items</h3>

                {items.map((item, index) => (
                  <div key={index} className="bg-gray-100 p-3 rounded-lg mb-3">
                    <InputBox
                      LabelName="Description"
                      Value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <InputBox
                        LabelName="Size"
                        Value={item.size}
                        onChange={(e) =>
                          handleItemChange(index, "size", e.target.value)
                        }
                      />
                      <InputBox
                        LabelName="Qty"
                        Type="number"
                        Value={item.qty}
                        onChange={(e) =>
                          handleItemChange(index, "qty", e.target.value)
                        }
                      />
                      <InputBox
                        LabelName="Color"
                        Value={item.color}
                        onChange={(e) =>
                          handleItemChange(index, "color", e.target.value)
                        }
                      />
                      <InputBox
                        LabelName="Rate"
                        Type="number"
                        Value={item.rate}
                        onChange={(e) =>
                          handleItemChange(index, "rate", e.target.value)
                        }
                      />
                    </div>

                    <InputBox LabelName="Amount" Value={item.amount} />

                    <Button
                      Label="Remove"
                      type="button"
                      className="hover:bg-red-600 mt-2"
                      onClick={() => removeItem(index)}
                    />
                  </div>
                ))}

                <Button Label="+ Add Item" type="button" onClick={addItem} />
              </div>

              {/* Summary */}
              <div className="border p-4 rounded-lg">
                <InputBox
                  LabelName="Total Billing Amount"
                  Type="number"
                  Name="billingAmount"
                  Value={formData.billingAmount}
                  onChange={handleChange}
                />

                <InputBox
                  LabelName="Discount"
                  Type="number"
                  Name="discount"
                  Value={formData.discount}
                  onChange={handleChange}
                />

                <InputBox
                  LabelName="Taxable Value"
                  Value={numbers.taxableValue.toFixed(2)}
                />
                <InputBox LabelName="SGST" Value={numbers.sgst.toFixed(2)} />
                <InputBox LabelName="CGST" Value={numbers.cgst.toFixed(2)} />
                <InputBox
                  LabelName="Total Tax"
                  Value={numbers.totalTax.toFixed(2)}
                />

                <InputBox
                  LabelName="Amount Received"
                  Type="number"
                  Name="receivedAmount"
                  Value={formData.receivedAmount}
                  onChange={handleChange}
                />

                <InputBox
                  LabelName="Due Amount"
                  Value={numbers.dueAmount.toFixed(2)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  Label="Cancel"
                  type="button"
                  className="bg-gray-400"
                  onClick={() => setIsEditOpen(false)}
                />
                <Button Label="Save Changes" type="submit" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingUI(CurrentInvoice);
