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
  const { currentInvoice, loading, error } = useSelector(
    (state) => state.Invoices
  );
  console.log(currentInvoice);
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
  });

  // Goods / Items for popup editor
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

  const initializeEditState = (inv) => {
    setFormData({
      customerName: inv?.customerName || "",
      customerAddress: inv?.customerAddress || "",
      customerPhone: inv?.customerPhone || "",
      customerGST: inv?.customerGST || "",
      customerState: inv?.customerState || "",
      invoiceNumber: inv?.invoiceNumber || "",
      invoiceDate: inv?.invoiceDate ? formatDateForInput(inv.invoiceDate) : "", // fallback if you store createdAt only
      referenceNo: inv?.referenceNo || "",
      buyerOrderNo: inv?.buyerOrderNo || "",
      dispatchDocNo: inv?.dispatchDocNo || "",
      deliveryNote: inv?.deliveryNote || "",
      destination: inv?.destination || "",
      paymentTerms: inv?.paymentTerms || "",
      billingAmount: inv?.billingAmount ?? "",
      receivedAmount: inv?.receivedAmount ?? "",
    });
    setItems(
      (inv?.items || []).map((it) => ({
        description: it.description || "",
        size: it.size || "",
        qty: Number(it.qty || 0),
        color: it.color || "",
        rate: Number(it.rate || 0),
        amount: Number(it.amount || 0),
      }))
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
  }, [invoiceId, dispatch]);

  // If popup opens or invoice changes, prefill edit state
  useEffect(() => {
    if (isEditOpen && currentInvoice) initializeEditState(currentInvoice);
  }, [isEditOpen, currentInvoice]);

  // ---------- Derived tax values (billingAmount is incl. tax) ----------
  const numbers = useMemo(() => {
    const billing = Number(formData.billingAmount || 0);
    const received = Number(formData.receivedAmount || 0);
    const totalRate = sgstRate + cgstRate;

    const taxableValue =
      totalRate > 0 ? billing / (1 + totalRate / 100) : billing;
    const sgst = (taxableValue * sgstRate) / 100;
    const cgst = (taxableValue * cgstRate) / 100;
    const totalTax = sgst + cgst;
    const dueAmount = billing - received;

    return {
      billing,
      received,
      taxableValue,
      sgst,
      cgst,
      totalTax,
      dueAmount,
    };
  }, [formData.billingAmount, formData.receivedAmount]);

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

  const handleUpdateInvoice = async (e) => {
    e.preventDefault();
    try {
      // startLoading();
      const fd = new FormData(formRef.current);

      // Append items as JSON (disabled inputs won't get into FormData)
      fd.append("items", JSON.stringify(items));

      // Append derived numbers (since we’re showing them disabled)
      fd.set("taxableValue", String(numbers.taxableValue.toFixed(2)));
      fd.set("sgstValue", String(numbers.sgst.toFixed(2)));
      fd.set("cgstValue", String(numbers.cgst.toFixed(2)));
      fd.set("totalTax", String(numbers.totalTax.toFixed(2)));
      fd.set("dueAmount", String(numbers.dueAmount.toFixed(2)));

      await dispatch(updateInvoice({ invoiceId, formData: fd, userId }));
      alert("Updated Successfully");
      setIsEditOpen(false);
    } catch (err) {
      console.log(err);
    } finally {
      // stopLoading();
    }
  };

  // ---------- Render ----------
  const currentProducts = currentInvoice?.items;
  const words = numberToWords.toWords(
    currentInvoice?.disBillAmount || currentInvoice?.billingAmount || 0
  );

  const handleDeleteInvoice = async () => {
    try {
      startLoading();
      const response = await FetchData(
        `users/delete-invoice/${invoiceId}`,
        "post"
      );
      console.log(response);
      alert(response.data.data);
      navigate("/");
    } catch (err) {
      console.log(err);
      alert(
        "Invoice can't be deleted due to some technical issue, Please try again later"
      );
    } finally {
      stopLoading();
    }
  };

  // const DeleteBrand = async (id) => {
  //   try {
  //     startLoading();
  //     const response = await FetchData(
  //       `brands/admin/delete-brand/${id}`,
  //       "delete"
  //     );
  //     console.log(response);
  //     alert(response.data.message);
  //     window.location.reload();
  //   } catch (err) {
  //     console.log(err);
  //     setError(err.response?.data?.message || "Failed to delete brand.");
  //   } finally {
  //     stopLoading();
  //   }
  // };

  return (
    <div className="py-20 w-full ">
      <div className="flex flex-col justify-center items-center gap-5 py-5">
        <div className="flex justify-start items-center w-[90%] gap-5">
          <h2 className="text-xl font-semibold">Invoice Id: {invoiceId}</h2>
          <Button Label="Print" onClick={reactToPrintFn} />
          <Button Label="Edit" onClick={openEdit} />
          <Button Label="Delete" onClick={handleDeleteInvoice} />
        </div>

        <div
          ref={contentRef}
          className="flex flex-col gap-6 p-4 mt-10 bg-white shadow-lg rounded-lg w-[95%] mx-auto text-xs border"
        >
          {/* ---------- Header ---------- */}
          <header className="border-b py-2 px-1 text-center border">
            <div>
              <img src={user?.image[0]?.url} className="w-10 rounded-full" />
              <h1 className="text-2xl font-bold uppercase">Tax Invoice</h1>
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
                  <strong>Invoice No.:</strong> {currentInvoice?.invoiceNumber}
                </p>
                <p className="border-b">
                  <strong>Dated(MMDDYY):</strong>{" "}
                  {new Date(currentInvoice?.invoiceDate).toLocaleDateString()}
                </p>
                <p className="border-b">
                  <strong>Reference No.:</strong> {currentInvoice?.referenceNo}
                </p>
                <p>
                  <strong>Buyer's Order No.:</strong>{" "}
                  {currentInvoice?.buyerOrderNo}
                </p>
              </div>
              <div>
                <p className="border-b">
                  <strong>Dispatch Doc No.:</strong>{" "}
                  {currentInvoice?.dispatchDocNo}
                </p>
                <p className="border-b">
                  <strong>Delivery Note:</strong> {currentInvoice?.deliveryNote}
                </p>
                <p className="border-b">
                  <strong>Destination:</strong> {currentInvoice?.destination}
                </p>
                <p>
                  <strong>Payment Terms:</strong> {currentInvoice?.paymentTerms}
                </p>
              </div>
            </div>
          </header>

          {/* ---------- Buyer & Consignee Details ---------- */}
          <section className="border py-2 px-1 grid grid-cols-2 gap-6 text-xs">
            <div>
              <h3 className="font-semibold border-b">Buyer (Bill To)</h3>
              <p className="border-b">
                <strong>{currentInvoice?.customerName}</strong>
              </p>
              <p className="border-b">{currentInvoice?.customerAddress}</p>
              <p className="border-b">Phone: {currentInvoice?.customerPhone}</p>
              <p className="border-b">GSTIN: {currentInvoice?.customerGST}</p>
              <p>State: {currentInvoice?.customerState}</p>
            </div>
            <div>
              <h3 className="font-semibold border-b">Consignee (Ship To)</h3>
              <p className="border-b">
                <strong>{currentInvoice?.customerName}</strong>
              </p>
              <p className="border-b">{currentInvoice?.customerAddress}</p>
              <p className="border-b">Phone: {currentInvoice?.customerPhone}</p>
              <p className="border-b">GSTIN: {currentInvoice?.customerGST}</p>
              <p>State: {currentInvoice?.customerState}</p>
            </div>
          </section>

          {/* ---------- Goods Table ---------- */}
          <section>
            <h3 className=" font-semibold mb-2">Description of Goods</h3>
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
                    <td className="border p-1 text-center">
                      {item.color || "No color specified"}
                    </td>
                    <td className="border p-1 text-center">{item.qty}</td>
                    <td className="border p-1 text-center">{item.size}</td>
                    <td className="border p-1 text-center">{item.rate}</td>
                    <td className="border p-1 text-right">{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* ---------- Tax & Summary ---------- */}
          <section className="flex justify-end">
            <div className="w-1/2 border rounded-lg p-1 text-xs">
              <div className="flex justify-between border-b">
                <span>Taxable Value</span>{" "}
                <span>₹ {currentInvoice?.taxableValue}</span>
              </div>
              <div className="flex justify-between border-b">
                <span>SGST (9%)</span>{" "}
                <span>₹ {currentInvoice?.sgstValue}</span>
              </div>
              <div className="flex justify-between border-b">
                <span>CGST (9%)</span>{" "}
                <span>₹ {currentInvoice?.cgstValue}</span>
              </div>
              <div className="flex justify-between border-b">
                <span>Total Tax</span> <span>₹ {currentInvoice?.totalTax}</span>
              </div>
              <div className="flex justify-between font-semibold border-b">
                <span>Sub Total</span>{" "}
                <span>₹ {currentInvoice?.billingAmount}</span>
              </div>
              <div className="flex justify-between font-semibold border-b">
                {currentInvoice?.discount > 0 ? (
                  <p className="flex justify-between font-semibold w-full">
                    <span>Discount</span>{" "}
                    <span>₹ {currentInvoice?.discount}</span>
                  </p>
                ) : (
                  ""
                )}
              </div>
              <div className="flex justify-between font-bold border-b">
                {currentInvoice?.discount > 0 ? (
                  <p className="flex justify-between font-semibold w-full">
                    <span>Grand Total</span>{" "}
                    <span>₹ {currentInvoice?.disBillAmount}</span>
                  </p>
                ) : (
                  <p className="flex justify-between font-semibold w-full">
                    <span>Grand Total</span>{" "}
                    <span>₹ {currentInvoice?.billingAmount}</span>
                  </p>
                )}
              </div>
              <div className="flex justify-between border-b">
                <span>Advance Amount Received</span>{" "}
                <span>₹ {currentInvoice?.receivedAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Due Amount</span>{" "}
                <span>₹ {currentInvoice?.dueAmount}</span>
              </div>
            </div>
          </section>

          {/* ---------- Declaration & Signature ---------- */}
          <section className="mt-6 text-xs">
            <p className="capitalize">
              <strong>Amount Chargeable (in words):</strong> {words} Rupees
              only.
            </p>
            <p className="mt-2">
              Declaration: We declare that this invoice shows the actual price
              of the goods described and that all particulars are true and
              correct.
            </p>
            <div className="mt-6 flex justify-between">
              <div>
                <p className="text-xs">
                  Terms & Conditions: <br />
                </p>
                <ul>
                  {user?.termsAndConditions?.descriptions?.map(
                    (item, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-700 flex gap-2 items-start"
                      >
                        <span className="font-medium text-gray-600">
                          {index + 1}.
                        </span>
                        <span>{item}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div className="text-right">
                <p>for {user?.businessName}</p>
                <p className="mt-10">Authorised Signatory</p>
              </div>
            </div>
          </section>

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

        {/* editing the current invoice  */}

        {isEditOpen && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-start overflow-scroll no-scrollbar z-50">
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
                    Required={false}
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
                    Type="text"
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
                    LabelName="Reference No. & Date"
                    Name="referenceNo"
                    Type="text"
                    Value={formData.referenceNo}
                    onChange={handleChange}
                    Required={false}
                  />
                  <InputBox
                    LabelName="Buyer's Order No."
                    Name="buyerOrderNo"
                    Type="text"
                    Value={formData.buyerOrderNo}
                    onChange={handleChange}
                    Required={false}
                  />
                  <InputBox
                    LabelName="Dispatch Document No."
                    Name="dispatchDocNo"
                    Type="text"
                    Value={formData.dispatchDocNo}
                    onChange={handleChange}
                    Required={false}
                  />
                  <InputBox
                    LabelName="Delivery Note"
                    Name="deliveryNote"
                    Type="text"
                    Value={formData.deliveryNote}
                    onChange={handleChange}
                    Required={false}
                  />
                  <InputBox
                    LabelName="Destination"
                    Name="destination"
                    Type="text"
                    Value={formData.destination}
                    onChange={handleChange}
                    Required={false}
                  />
                  <InputBox
                    LabelName="Mode/Terms of Payment"
                    Name="paymentTerms"
                    Type="text"
                    Value={formData.paymentTerms}
                    onChange={handleChange}
                    Required={false}
                  />
                </div>

                {/* Goods / Items */}
                <div className="border p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Goods / Items</h3>

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
                          Required={false}
                          LabelName="Color Code"
                          Type="text"
                          Placeholder="Color code"
                          Name={`color-${index}`}
                          Value={item.color}
                          onChange={(e) =>
                            handleItemChange(index, "color", e.target.value)
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

                {/* Tax & Summary */}
                <div className="border p-4 rounded-lg">
                  <h3 className="text-lg font-semibold">Tax & Summary</h3>

                  <InputBox
                    LabelName="Total Billing Amount (incl. tax)"
                    Name="billingAmount"
                    Type="number"
                    Value={formData.billingAmount}
                    onChange={handleChange}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <InputBox
                      LabelName="Taxable Value"
                      Name="taxableValue"
                      Value={numbers.taxableValue.toFixed(2)}
                      DisableRequired={true}
                    />
                    <InputBox
                      LabelName={`SGST (${sgstRate}%)`}
                      Name="sgstValue"
                      Value={numbers.sgst.toFixed(2)}
                      DisableRequired={true}
                    />
                    <InputBox
                      LabelName={`CGST (${cgstRate}%)`}
                      Name="cgstValue"
                      Value={numbers.cgst.toFixed(2)}
                      DisableRequired={true}
                    />
                    <InputBox
                      LabelName="Total Tax"
                      Name="totalTax"
                      Value={numbers.totalTax.toFixed(2)}
                      DisableRequired={true}
                    />
                  </div>

                  <InputBox
                    LabelName="Amount Received"
                    Name="receivedAmount"
                    Type="number"
                    Value={formData.receivedAmount}
                    onChange={handleChange}
                  />

                  <InputBox
                    LabelName="Due Amount"
                    Name="dueAmount"
                    Value={numbers.dueAmount.toFixed(2)}
                    DisableRequired={true}
                  />
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

export default LoadingUI(CurrentInvoice);
