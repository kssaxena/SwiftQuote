import React, { useRef, useState } from "react";
import Button from "../../components/Button";
import InputBox from "../../components/Input";
import LoadingUI from "../../components/LoadingUI";
import { useDispatch, useSelector } from "react-redux";
import { createPurchaseOrder } from "../../utils/slice/PurchaseOrderSlice";

const PurchaseOrderForm = ({ onCancel, startLoading, stopLoading }) => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.UserInfo.user);
  const formRef = useRef();

  // Goods / Items
  const [items, setItems] = useState([
    { description: "", size: "", color: "", qty: 1, rate: 0, amount: 0 },
  ]);

  const [discount, setDiscount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [error, setError] = useState("");

  const handleDiscountChange = (e) => {
    const value = e.target.value;
    const num = parseFloat(value);

    setDiscount(value);

    if (value === "" || num === 0) {
      setError("");
      return;
    }

    if (isNaN(num) || num < 1 || num > 100) {
      setError("Discount must be between 1 and 100.");
    } else {
      setError("");
    }
  };

  const handleDiscountAmountChange = (e) => {
    const value = e.target.value;
    const num = parseFloat(value);

    setDiscountAmount(value);

    if (value === "" || num === 0) {
      setError("");
      return;
    }

    if (isNaN(num) || num < 1 || num > 100) {
      setError("Discount must be between 1 and 100.");
    } else {
      setError("");
    }
  };

  // Tax & Summary
  const [billingAmount, setBillingAmount] = useState("");
  const [advance, setAdvance] = useState("");

  // GST rates
  const sgstRate = 9;
  const cgstRate = 9;
  const totalRate = sgstRate + cgstRate;

  // Reverse calculations based on billing amount (incl. tax)
  const taxableValue = billingAmount / (1 + totalRate / 100);
  const sgst = (taxableValue * sgstRate) / 100;
  const cgst = (taxableValue * cgstRate) / 100;
  const totalTax = sgst + cgst;
  const dueAmount = billingAmount - advance;

  // Handle Goods / Items
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    if (field === "qty" || field === "rate") {
      updatedItems[index].amount =
        (Number(updatedItems[index].qty) || "") *
        (Number(updatedItems[index].rate) || "");
    }

    setItems(updatedItems);
  };

  // Add new item row
  const addItem = () => {
    setItems([
      ...items,
      { description: "", size: "", color: "", qty: 1, rate: 0, amount: 0 },
    ]);
  };

  // Remove item row
  const removeItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  // Total of all goods
  const totalGoodsAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const handleGeneratePurchaseOrder = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData(formRef.current);
      formData.append("items", JSON.stringify(items));

      startLoading();

      await dispatch(createPurchaseOrder({ userId: user[0]?._id, formData }));

      // Reset form + states
      formRef.current.reset();
      setItems([{ description: "", size: "", qty: 1, rate: 0, amount: 0 }]);
      setBillingAmount("");
      setAdvance("");
      onCancel();
    } catch (err) {
      console.log(err);
      alert(
        err?.payload?.message ||
          "An error occurred while generating the purchase order.",
      );
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="flex justify-center items-center ">
      <form
        className="space-y-6 w-screen"
        ref={formRef}
        onSubmit={handleGeneratePurchaseOrder}
      >
        <h2 className="text-xl font-semibold">Purchase Order Form</h2>

        <div className="flex lg:gap-5 gap-2 lg:flex-row flex-col">
          {/* ---------- Supplier Details ---------- */}
          <div className="space-y-3 border p-4 rounded-lg shadow w-full">
            <h3 className="text-lg font-semibold flex-col flex ">
              Supplier Details{" "}
              <span className="text-xs text-red-600">
                ( * Marked fields are mandatory)
              </span>
            </h3>
            <div className="flex justify-center items-center lg:gap-2 lg:flex-row flex-col">
              <InputBox
                LabelName="Supplier Name *"
                Type="text"
                Placeholder="Enter Supplier Name"
                Name="supplierName"
              />

              <InputBox
                LabelName="Address *"
                Type="text"
                Placeholder="Enter Address"
                Name="supplierAddress"
              />

              <InputBox
                LabelName="Phone Number *"
                Type="text"
                Placeholder="Enter Phone Number"
                Name="supplierPhone"
                onKeyPress={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight"
                  ) {
                    e.preventDefault();
                  }
                }}
                maxLength={10}
                pattern="\d{10}"
                title="Please enter a valid 10-digit phone number"
              />

              <InputBox
                LabelName="GST Number"
                Type="text"
                Placeholder="Enter GST Number"
                Name="supplierGST"
                Required={false}
              />

              <InputBox
                LabelName="State Name & Code *"
                Type="text"
                Placeholder="Enter State Name & Code"
                Name="supplierState"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 border p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold flex flex-col">
            Purchase Order Details{" "}
            <span className="text-xs text-red-600">
              ( * Marked fields are mandatory)
            </span>
          </h3>

          <div className="flex justify-center items-center lg:gap-2  lg:flex-row flex-col">
            <InputBox
              LabelName="PO Number *"
              Type="text"
              Placeholder="Enter Purchase Order Number"
              Name="purchaseOrderNumber"
            />

            <InputBox
              LabelName="PO Date *"
              Type="date"
              Placeholder="Select PO Date"
              Name="purchaseOrderDate"
            />

            <InputBox
              LabelName="Expected Delivery Date *"
              Type="date"
              Name="expectedDeliveryDate"
            />

            <InputBox
              LabelName="Reference No."
              Type="text"
              Placeholder="Enter Reference No."
              Name="referenceNo"
              Required={false}
            />
          </div>

          <div className="flex justify-center items-center lg:gap-2  lg:flex-row flex-col">
            <InputBox
              LabelName="Payment Terms"
              Type="text"
              Placeholder="Enter Payment Terms"
              Name="paymentTerms"
              Required={false}
            />

            <InputBox
              LabelName="Delivery Terms"
              Type="text"
              Placeholder="Enter Delivery Terms"
              Name="deliveryTerms"
              Required={false}
            />

            <InputBox
              LabelName="Notes"
              Type="text"
              Placeholder="Enter Notes"
              Name="notes"
              Required={false}
            />
          </div>
        </div>

        <div className="flex lg:gap-5 gap-2 lg:flex-row flex-col">
          {/* ---------- Goods / Items Section ---------- */}
          <div className="space-y-3 border p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold flex flex-col">
              Goods / Items{" "}
              <span className="text-xs text-red-600">
                ( ** Marked fields are mandatory)
              </span>
              <span className="text-xs text-red-600 text-justify">
                ( ** Just enter the rate of the product, rest will be calculated
                automatically.)
              </span>
            </h3>

            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col justify-center items-center bg-neutral-300 p-2 rounded-xl"
              >
                <InputBox
                  LabelName="Description *"
                  Placeholder="Item Name and Description"
                  Name={`description-${index}`}
                  Value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                />
                <div className="flex justify-center items-center  lg:flex-row flex-col">
                  <InputBox
                    Required={false}
                    LabelName="Size"
                    Placeholder="Size"
                    Name={`size-${index}`}
                    Value={item.size}
                    onChange={(e) =>
                      handleItemChange(index, "size", e.target.value)
                    }
                  />
                  <InputBox
                    LabelName="Quantity *"
                    Type="number"
                    Placeholder="Qty"
                    Name={`qty-${index}`}
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
                    LabelName="Rate *"
                    Placeholder="Rate"
                    Name={`rate-${index}`}
                    Value={item.rate}
                    onChange={(e) =>
                      handleItemChange(index, "rate", e.target.value)
                    }
                  />
                </div>
                <InputBox
                  LabelName="Amount"
                  Type="number"
                  Placeholder="Amount"
                  Name={`amount-${index}`}
                  Value={item.amount}
                  DisableRequired={true}
                />
                <Button
                  Label="✕"
                  onClick={() => removeItem(index)}
                  className="hover:bg-red-600"
                />
              </div>
            ))}

            {/* Add Item Button */}
            <Button type="button" onClick={addItem} Label="+ Add Item" />

            {/* Total Goods */}
            <div className="text-right font-semibold text-lg mt-4">
              Total Goods Amount: ₹{totalGoodsAmount.toFixed(2)}
            </div>
          </div>

          {/* ---------- Tax & Summary Section ---------- */}
          <div className="border p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">
              Tax & Summary{" "}
              <span className="text-xs text-red-600">
                ( ** All fields are mandatory)
              </span>
            </h3>

            <InputBox
              LabelName="Total Amount"
              Placeholder="Enter Total Billing Amount"
              Name="billingAmount"
              Value={billingAmount}
              onChange={(e) => setBillingAmount(Number(e.target.value))}
            />

            <div className="">
              <InputBox
                LabelName={"Taxable Value"}
                Value={taxableValue.toFixed(2)}
                Name={"taxableValue"}
              />
              <InputBox
                LabelName={" SGST (9%)"}
                Value={sgst.toFixed(2)}
                Name={"sgstValue"}
              />
              <InputBox
                LabelName={"CGST (9%)"}
                Value={cgst.toFixed(2)}
                Name={"cgstValue"}
              />
              <InputBox
                LabelName={" Total Tax"}
                Value={totalTax.toFixed(2)}
                Name={"totalTax"}
              />
            </div>

            <InputBox
              LabelName="Advance Amount"
              Type="text"
              Placeholder="Enter Advance Amount"
              Name="advanceAmount"
              Value={advance}
              onChange={(e) => setAdvance(Number(e.target.value))}
              onKeyPress={(e) => {
                if (
                  !/[0-9]/.test(e.key) &&
                  e.key !== "Backspace" &&
                  e.key !== "Delete" &&
                  e.key !== "ArrowLeft" &&
                  e.key !== "ArrowRight"
                ) {
                  e.preventDefault();
                }
              }}
            />
            <InputBox
              LabelName="Due Amount"
              Placeholder="Due Amount"
              Name="dueAmount"
              Value={dueAmount.toFixed(2)}
            />
          </div>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="flex justify-center items-center lg:flex-row flex-col gap-2">
          <InputBox
            LabelName="Discount (if any) %"
            Placeholder="Discount in percentage"
            Name="discount"
            Type="text"
            Required={false}
            value={discount}
            onChange={handleDiscountChange}
            onKeyPress={(e) => {
              if (
                !/[0-9]/.test(e.key) &&
                e.key !== "Backspace" &&
                e.key !== "Delete" &&
                e.key !== "ArrowLeft" &&
                e.key !== "ArrowRight"
              ) {
                e.preventDefault();
              }
            }}
          />
          <p>or</p>
          <InputBox
            LabelName="Discount (if any in amount)"
            Placeholder="Discount in amount"
            Name="shippingCharge"
            Type="text"
            Required={false}
            onKeyPress={(e) => {
              if (
                !/[0-9]/.test(e.key) &&
                e.key !== "Backspace" &&
                e.key !== "Delete" &&
                e.key !== "ArrowLeft" &&
                e.key !== "ArrowRight"
              ) {
                e.preventDefault();
              }
            }}
          />
        </div>

        <div className="flex justify-center items-center lg:gap-10 gap-2 lg:flex-row flex-col">
          <Button
            Label="Generate PO"
            className={`w-full lg:w-fit`}
            type={"submit"}
          />
          <Button
            Label="Cancel"
            type={"reset"}
            onClick={onCancel}
            className={`w-full lg:w-fit hover:bg-red-500`}
          />
        </div>
      </form>
    </div>
  );
};

export default LoadingUI(PurchaseOrderForm);
