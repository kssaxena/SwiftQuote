import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchPurchaseOrderById,
  updatePurchaseOrder,
} from "../../utils/slice/PurchaseOrderSlice";
import InputBox from "../../components/Input";
import Button from "../../components/Button";
import { useReactToPrint } from "react-to-print";
import LoadingUI from "../../components/LoadingUI";
import numberToWords from "number-to-words";
import { FetchData } from "../../utils/FetchFromApi";

const sgstRate = 9;
const cgstRate = 9;

const CurrentPurchaseOrder = ({ startLoading, stopLoading }) => {
  const { purchaseOrderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.UserInfo.user[0]);
  const userId = user?._id;
  const { currentPurchaseOrder } = useSelector(
    (state) => state.PurchaseOrders || {},
  );

  const contentRef = useRef();
  const formRef = useRef();

  const [isEditOpen, setIsEditOpen] = useState(false);

  // ---------- Local edit state ----------
  const [formData, setFormData] = useState({
    supplierName: "",
    supplierAddress: "",
    supplierPhone: "",
    supplierGST: "",
    supplierState: "",
    purchaseOrderNumber: "",
    purchaseOrderDate: "",
    expectedDeliveryDate: "",
    referenceNo: "",
    paymentTerms: "",
    deliveryTerms: "",
    billingAmount: "",
    advanceAmount: "",
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

  const initializeEditState = (po) => {
    setFormData({
      supplierName: po?.supplierName || "",
      supplierAddress: po?.supplierAddress || "",
      supplierPhone: po?.supplierPhone || "",
      supplierGST: po?.supplierGST || "",
      supplierState: po?.supplierState || "",
      purchaseOrderNumber: po?.purchaseOrderNumber || "",
      expectedDeliveryDate: formatDateForInput(po?.expectedDeliveryDate) || "",
      purchaseOrderDate: formatDateForInput(po?.purchaseOrderDate),
      referenceNo: po?.referenceNo || "",
      paymentTerms: po?.paymentTerms || "",
      deliveryTerms: po?.deliveryTerms || "",
      billingAmount: po?.billingAmount ?? "",
      advanceAmount: po?.advanceAmount ?? "",
      discount: po?.discount ?? 0,
      disBillAmount: po?.disBillAmount ?? po?.billingAmount,
    });

    setItems(
      po?.items?.map((it) => ({
        description: it.description || "",
        size: it.size || "",
        qty: Number(it.qty || 0),
        color: it.color || "",
        rate: Number(it.rate || 0),
        amount: Number(it.amount || 0),
      })) || [],
    );
  };

  const safePONumber = currentPurchaseOrder?.purchaseOrderNumber?.replace(
    /[\/:]/g,
    "-",
  );

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `PurchaseOrder-${safePONumber}`,
  });

  useEffect(() => {
    if (purchaseOrderId) dispatch(fetchPurchaseOrderById(purchaseOrderId));
  }, [purchaseOrderId]);

  useEffect(() => {
    if (isEditOpen && currentPurchaseOrder)
      initializeEditState(currentPurchaseOrder);
  }, [isEditOpen, currentPurchaseOrder]);

  // ---------- TAX CALCULATIONS ----------
  const numbers = useMemo(() => {
    const billing = Number(formData.billingAmount || 0);
    const discount = Number(formData.discount || 0);
    const advance = Number(formData.advanceAmount || 0);

    const afterDiscount = billing - discount;
    const totalRate = sgstRate + cgstRate;

    const taxableValue =
      totalRate > 0 ? afterDiscount / (1 + totalRate / 100) : afterDiscount;

    const sgst = (taxableValue * sgstRate) / 100;
    const cgst = (taxableValue * cgstRate) / 100;
    const totalTax = sgst + cgst;
    const dueAmount = afterDiscount - advance;

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
  }, [formData.billingAmount, formData.discount, formData.advanceAmount]);

  // ---------- CHANGE HANDLERS ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index][field] = value;

      if (field === "qty" || field === "rate") {
        updated[index].amount =
          (Number(updated[index].qty) || 0) *
          (Number(updated[index].rate) || 0);
      }

      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { description: "", size: "", qty: 1, color: "", rate: 0, amount: 0 },
    ]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------- SUBMIT HANDLERS ----------
  const handleUpdatePurchaseOrder = async (e) => {
    e.preventDefault();
    try {
      startLoading();
      const formDataObj = new FormData(formRef.current);
      formDataObj.append("items", JSON.stringify(items));

      await dispatch(
        updatePurchaseOrder({
          purchaseOrderId,
          userId,
          formData: formDataObj,
        }),
      );

      setIsEditOpen(false);
    } catch (err) {
      alert(
        err?.payload?.message ||
          "An error occurred while updating the purchase order.",
      );
    } finally {
      stopLoading();
    }
  };

  const handleDeletePurchaseOrder = async () => {
    if (
      window.confirm("Are you sure you want to delete this Purchase Order?")
    ) {
      try {
        startLoading();
        const res = await FetchData(
          `users/delete-purchase-order/${purchaseOrderId}/${userId}`,
          "post",
        );
        alert(res.data.data);
        navigate("/");
      } finally {
        stopLoading();
      }
    }
  };

  const currentProducts = currentPurchaseOrder?.items;
  const words = numberToWords.toWords(
    currentPurchaseOrder?.disBillAmount ||
      currentPurchaseOrder?.billingAmount ||
      0,
  );

  // ------------------------------------------------------------------
  //                         RENDER STARTS HERE
  // ------------------------------------------------------------------

  return (
    <div className="py-20 w-full">
      {/* ---------- TOP ACTIONS (hidden on print) ---------- */}
      <div className="flex flex-col justify-center items-center gap-5 py-5 no-print">
        <div className="flex justify-start items-center w-[90%] gap-5">
          <h2 className="text-xl font-semibold">
            Purchase Order Id: {purchaseOrderId}
          </h2>
          <Button Label="Print" onClick={reactToPrintFn} />
          <Button Label="Edit" onClick={() => setIsEditOpen(true)} />
          <Button Label="Delete" onClick={handleDeletePurchaseOrder} />
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
            <h1 className="text-2xl font-bold uppercase">Purchase Order</h1>
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
                <strong>PO No.: </strong>
                {currentPurchaseOrder?.purchaseOrderNumber}
              </p>
              <p className="border-b">
                <strong>Dated: </strong>
                {new Date(
                  currentPurchaseOrder?.purchaseOrderDate,
                ).toLocaleDateString()}
              </p>
              <p className="border-b">
                <strong>Reference No: </strong>
                {currentPurchaseOrder?.referenceNo}
              </p>
              <p>
                <strong>Status: </strong>
                {currentPurchaseOrder?.status}
              </p>
            </div>
            <div>
              <p className="border-b">
                <strong>Expected Delivery: </strong>
                {new Date(
                  currentPurchaseOrder?.expectedDeliveryDate,
                ).toLocaleDateString()}
              </p>
              <p className="border-b">
                <strong>Payment Terms: </strong>
                {currentPurchaseOrder?.paymentTerms}
              </p>
              <p className="border-b">
                <strong>Delivery Terms: </strong>
                {currentPurchaseOrder?.deliveryTerms}
              </p>
              <p>
                <strong>Payment Status: </strong>
                {currentPurchaseOrder?.paymentStatus}
              </p>
            </div>
          </div>
        </header>

        {/* ---------- Supplier / Vendor ---------- */}
        <section className="border py-2 px-1 grid grid-cols-2 gap-6 text-xs no-break">
          <div>
            <h3 className="font-semibold border-b">Supplier (Vendor)</h3>
            <p>
              <strong>Name:</strong> {currentPurchaseOrder?.supplierName}
            </p>
            <p>
              <strong>Address:</strong> {currentPurchaseOrder?.supplierAddress}
            </p>
            <p>
              <strong>Phone:</strong> {currentPurchaseOrder?.supplierPhone}
            </p>
            <p>
              <strong>State:</strong> {currentPurchaseOrder?.supplierState}
            </p>
            <p>
              <strong>GST:</strong> {currentPurchaseOrder?.supplierGST}
            </p>
          </div>
          <div>
            <h3 className="font-semibold border-b">Ship To (Our Address)</h3>
            <p>
              <strong>Name:</strong> {user?.businessName}
            </p>
            <p>
              <strong>Address:</strong> {user?.businessAddress}
            </p>
            <p>
              <strong>State:</strong> {user?.businessState}
            </p>
            <p>
              <strong>GST:</strong> {user?.gstNumber}
            </p>
          </div>
        </section>

        {/* ---------- Items Table ---------- */}
        <section className="border py-2 px-1 no-break">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-xs">
                <th className="border p-1 text-left font-semibold">
                  Description
                </th>
                <th className="border p-1 text-center font-semibold">Size</th>
                <th className="border p-1 text-center font-semibold">Color</th>
                <th className="border p-1 text-center font-semibold">Qty</th>
                <th className="border p-1 text-right font-semibold">Rate</th>
                <th className="border p-1 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts?.map((item, idx) => (
                <tr key={idx} className="text-xs">
                  <td className="border p-1">{item.description}</td>
                  <td className="border p-1 text-center">{item.size || "-"}</td>
                  <td className="border p-1 text-center">
                    {item.color || "-"}
                  </td>
                  <td className="border p-1 text-center">{item.qty}</td>
                  <td className="border p-1 text-right">₹{item.rate}</td>
                  <td className="border p-1 text-right">₹{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ---------- Tax Summary ---------- */}
        <section className="border p-2 grid grid-cols-2 gap-4 text-xs no-break">
          <div>
            <p>
              <strong>Taxable Value:</strong> ₹
              {currentPurchaseOrder?.taxableValue?.toFixed(2)}
            </p>
            <p>
              <strong>SGST (9%):</strong> ₹
              {currentPurchaseOrder?.sgstValue?.toFixed(2)}
            </p>
            <p>
              <strong>CGST (9%):</strong> ₹
              {currentPurchaseOrder?.cgstValue?.toFixed(2)}
            </p>
            <p>
              <strong>Total Tax:</strong> ₹
              {currentPurchaseOrder?.totalTax?.toFixed(2)}
            </p>
          </div>
          <div className="border-l pl-2">
            <p className="text-sm font-semibold">
              <strong>Billing Amount:</strong> ₹
              {currentPurchaseOrder?.billingAmount?.toFixed(2)}
            </p>
            <p className="text-sm">
              <strong>Discount:</strong> ₹
              {currentPurchaseOrder?.discount?.toFixed(2)}
            </p>
            <p className="text-sm border-t pt-1 font-semibold">
              <strong>Discounted Amount:</strong> ₹
              {currentPurchaseOrder?.disBillAmount?.toFixed(2)}
            </p>
            <p className="text-sm">
              <strong>Advance:</strong> ₹
              {currentPurchaseOrder?.advanceAmount?.toFixed(2)}
            </p>
            <p className="text-lg font-bold border-t pt-1">
              <strong>Due Amount:</strong> ₹
              {currentPurchaseOrder?.dueAmount?.toFixed(2)}
            </p>
          </div>
        </section>

        {/* ---------- Amount in Words ---------- */}
        <section className="border p-2 text-xs no-break">
          <p>
            <strong>Amount in Words (Including Tax):</strong> {words}
          </p>
        </section>

        {/* ---------- Notes ---------- */}
        {currentPurchaseOrder?.notes && (
          <section className="border p-2 text-xs no-break">
            <p>
              <strong>Notes:</strong> {currentPurchaseOrder?.notes}
            </p>
          </section>
        )}
      </div>

      {/* ---------- EDIT FORM (hidden when not editing) ---------- */}
      {isEditOpen && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
          <form
            ref={formRef}
            onSubmit={handleUpdatePurchaseOrder}
            className="bg-white p-6 rounded-lg shadow-lg w-[95%] max-h-[95vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">Edit Purchase Order</h2>

            {/* Supplier Details */}
            <div className="mb-4 border p-4 rounded">
              <h3 className="font-bold mb-2">Supplier Details</h3>
              <InputBox
                LabelName="Supplier Name"
                Name="supplierName"
                Value={formData.supplierName}
                onChange={handleChange}
              />
              <InputBox
                LabelName="Address"
                Name="supplierAddress"
                Value={formData.supplierAddress}
                onChange={handleChange}
              />
              <InputBox
                LabelName="Phone"
                Name="supplierPhone"
                Value={formData.supplierPhone}
                onChange={handleChange}
              />
              <InputBox
                LabelName="GST"
                Name="supplierGST"
                Value={formData.supplierGST}
                onChange={handleChange}
                Required={false}
              />
              <InputBox
                LabelName="State"
                Name="supplierState"
                Value={formData.supplierState}
                onChange={handleChange}
              />
            </div>

            {/* PO Details */}
            <div className="mb-4 border p-4 rounded">
              <h3 className="font-bold mb-2">PO Details</h3>
              <InputBox
                LabelName="PO Number"
                Name="purchaseOrderNumber"
                Value={formData.purchaseOrderNumber}
                onChange={handleChange}
              />
              <InputBox
                LabelName="PO Date"
                Type="date"
                Name="purchaseOrderDate"
                Value={formData.purchaseOrderDate}
                onChange={handleChange}
              />
              <InputBox
                LabelName="Expected Delivery Date"
                Type="date"
                Name="expectedDeliveryDate"
                Value={formData.expectedDeliveryDate}
                onChange={handleChange}
              />
              <InputBox
                LabelName="Reference No"
                Name="referenceNo"
                Value={formData.referenceNo}
                onChange={handleChange}
                Required={false}
              />
              <InputBox
                LabelName="Payment Terms"
                Name="paymentTerms"
                Value={formData.paymentTerms}
                onChange={handleChange}
                Required={false}
              />
              <InputBox
                LabelName="Delivery Terms"
                Name="deliveryTerms"
                Value={formData.deliveryTerms}
                onChange={handleChange}
                Required={false}
              />
            </div>

            {/* Items */}
            <div className="mb-4 border p-4 rounded">
              <h3 className="font-bold mb-2">Items</h3>
              {items.map((item, index) => (
                <div key={index} className="bg-gray-100 p-2 rounded mb-2">
                  <InputBox
                    LabelName="Description"
                    Value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                  />
                  <InputBox
                    LabelName="Size"
                    Value={item.size}
                    onChange={(e) =>
                      handleItemChange(index, "size", e.target.value)
                    }
                    Required={false}
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
                    Required={false}
                  />
                  <InputBox
                    LabelName="Rate"
                    Value={item.rate}
                    onChange={(e) =>
                      handleItemChange(index, "rate", e.target.value)
                    }
                  />
                  <Button
                    Label="Remove Item"
                    onClick={() => removeItem(index)}
                  />
                </div>
              ))}
              <Button Label="Add Item" onClick={addItem} type="button" />
            </div>

            {/* Tax & Summary */}
            <div className="mb-4 border p-4 rounded">
              <h3 className="font-bold mb-2">Tax & Summary</h3>
              <InputBox
                LabelName="Billing Amount"
                Name="billingAmount"
                Value={formData.billingAmount}
                onChange={handleChange}
              />
              <InputBox
                LabelName="Advance Amount"
                Name="advanceAmount"
                Value={formData.advanceAmount}
                onChange={handleChange}
              />
              <InputBox
                LabelName="Discount"
                Name="discount"
                Value={formData.discount}
                onChange={handleChange}
                Required={false}
              />
            </div>

            <div className="flex gap-2">
              <Button Label="Save" type="submit" />
              <Button
                Label="Cancel"
                onClick={() => setIsEditOpen(false)}
                type="button"
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LoadingUI(CurrentPurchaseOrder);
