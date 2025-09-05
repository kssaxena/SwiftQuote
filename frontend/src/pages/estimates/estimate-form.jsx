import React, { useRef, useState } from "react";
import Button from "../../components/Button";
import InputBox from "../../components/Input";
import LoadingUI from "../../components/LoadingUI";
import { useDispatch, useSelector } from "react-redux";
import { createEstimate } from "../../utils/slice/EstimateSlice";

const Estimate_form = ({ onCancel, startLoading, stopLoading }) => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.UserInfo.user);
  const formRef = useRef();

  const [items, setItems] = useState([
    { description: "", size: "", color: "", qty: 1, rate: 0, amount: 0 },
  ]);
  const [billingAmount, setBillingAmount] = useState("");
  const [received, setReceived] = useState("");

  const sgstRate = 9;
  const cgstRate = 9;
  const totalRate = sgstRate + cgstRate;
  const taxableValue = billingAmount / (1 + totalRate / 100);
  const sgst = (taxableValue * sgstRate) / 100;
  const cgst = (taxableValue * cgstRate) / 100;
  const totalTax = sgst + cgst;
  const dueAmount = billingAmount - received;
  const totalGoodsAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    if (field === "qty" || field === "rate") {
      updatedItems[index].amount =
        (Number(updatedItems[index].qty) || 0) *
        (Number(updatedItems[index].rate) || 0);
    }
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { description: "", size: "", color: "", qty: 1, rate: 0, amount: 0 },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleGenerateEstimate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(formRef.current);
      formData.append("items", JSON.stringify(items));

      startLoading();
      await dispatch(createEstimate({ userId: user[0]?._id, formData }));

      alert("Estimate generated successfully!");
      formRef.current.reset();
      setItems([{ description: "", size: "", qty: 1, rate: 0, amount: 0 }]);
      setBillingAmount("");
      setReceived("");
      onCancel();
    } catch (err) {
      console.error(err);
      alert(
        err?.payload?.message ||
          "An error occurred while generating the estimate."
      );
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="flex justify-center items-center">
      <form
        className="space-y-6 w-screen"
        ref={formRef}
        onSubmit={handleGenerateEstimate}
      >
        <h2 className="text-xl font-semibold">Estimate Form</h2>

        <div className="flex lg:gap-5 gap-2 lg:flex-row flex-col">
          {/* ---------- Customer Details ---------- */}
          <div className="space-y-3 border p-4 rounded-lg shadow w-full">
            <h3 className="text-lg font-semibold flex-col flex ">
              Customer Details{" "}
              <span className="text-xs text-red-600">
                ( * Marked fields are mandatory)
              </span>
            </h3>
            <div className="flex justify-center items-center lg:gap-2 lg:flex-row flex-col">
              <InputBox LabelName="Customer Name *" Name="customerName" />
              <InputBox LabelName="Address *" Name="customerAddress" />
              <InputBox LabelName="Phone Number *" Name="customerPhone" />
              <InputBox
                LabelName="GST Number"
                Name="customerGST"
                Required={false}
              />
              <InputBox LabelName="State Name & Code *" Name="customerState" />
            </div>
          </div>
        </div>

        {/* ---------- Estimate Details ---------- */}
        <div className="space-y-3 border p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold flex flex-col">
            Estimate Details{" "}
            <span className="text-xs text-red-600">
              ( * Marked fields are mandatory)
            </span>
          </h3>

          <div className="flex justify-center items-center lg:gap-2 lg:flex-row flex-col">
            <InputBox LabelName="Estimate Number *" Name="estimateNumber" />
            <InputBox
              LabelName="Estimate Date *"
              Type="date"
              Name="estimateDate"
            />
            <InputBox LabelName="Valid Until *" Type="date" Name="validUntil" />
            <InputBox LabelName="Destination *" Name="destination" />
            <InputBox LabelName="Mode of Payment *" Name="paymentTerms" />
          </div>

          <div className="flex justify-center items-center lg:gap-2 lg:flex-row flex-col">
            <InputBox
              LabelName="Reference No."
              Name="referenceNo"
              Required={false}
            />
            <InputBox
              LabelName="Buyer's Order No."
              Name="buyerOrderNo"
              Required={false}
            />
            <InputBox
              LabelName="Dispatch Document No."
              Name="dispatchDocNo"
              Required={false}
            />
            <InputBox
              LabelName="Delivery Note"
              Name="deliveryNote"
              Required={false}
            />
          </div>
        </div>

        <div className="flex lg:gap-5 gap-2 lg:flex-row flex-col">
          {/* ---------- Goods / Items ---------- */}
          <div className="space-y-3 border p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold flex flex-col">
              Goods / Items{" "}
              <span className="text-xs text-red-600">
                ( ** Marked fields are mandatory)
              </span>
            </h3>

            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col justify-center items-center bg-neutral-300 p-2 rounded-xl"
              >
                <InputBox
                  LabelName="Description *"
                  Name={`description-${index}`}
                  Value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                />
                <div className="flex justify-center items-center lg:flex-row flex-col">
                  <InputBox
                    LabelName="Size"
                    Name={`size-${index}`}
                    Value={item.size}
                    onChange={(e) =>
                      handleItemChange(index, "size", e.target.value)
                    }
                  />
                  <InputBox
                    LabelName="Quantity *"
                    Type="number"
                    Name={`qty-${index}`}
                    Value={item.qty}
                    onChange={(e) =>
                      handleItemChange(index, "qty", e.target.value)
                    }
                  />
                  <InputBox
                    LabelName="Color Code"
                    Name={`color-${index}`}
                    Value={item.color}
                    onChange={(e) =>
                      handleItemChange(index, "color", e.target.value)
                    }
                  />
                  <InputBox
                    LabelName="Rate *"
                    Type="number"
                    Name={`rate-${index}`}
                    Value={item.rate}
                    onChange={(e) =>
                      handleItemChange(index, "rate", e.target.value)
                    }
                  />
                </div>
                <InputBox
                  LabelName="Amount"
                  Name={`amount-${index}`}
                  Value={item.amount}
                  DisableRequired
                />
                <Button
                  Label="✕"
                  onClick={() => removeItem(index)}
                  className="hover:bg-red-600"
                />
              </div>
            ))}

            <Button type="button" onClick={addItem} Label="+ Add Item" />
            <div className="text-right font-semibold text-lg mt-4">
              Total Goods Amount: ₹{totalGoodsAmount.toFixed(2)}
            </div>
          </div>

          {/* ---------- Tax & Summary ---------- */}
          <div className="border p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">
              Tax & Summary{" "}
              <span className="text-xs text-red-600">
                ( ** All fields are mandatory)
              </span>
            </h3>
            <InputBox
              LabelName="Total Billing Amount (incl. tax)"
              Type="number"
              Name="billingAmount"
              Value={billingAmount}
              onChange={(e) => setBillingAmount(Number(e.target.value))}
            />
            <InputBox
              LabelName="Taxable Value"
              Value={taxableValue.toFixed(2)}
              Name="taxableValue"
            />
            <InputBox
              LabelName="SGST (9%)"
              Value={sgst.toFixed(2)}
              Name="sgst"
            />
            <InputBox
              LabelName="CGST (9%)"
              Value={cgst.toFixed(2)}
              Name="cgst"
            />
            <InputBox
              LabelName="Total Tax"
              Value={totalTax.toFixed(2)}
              Name="totalTax"
            />
            <InputBox
              LabelName="Amount Received"
              Type="number"
              Name="receivedAmount"
              Value={received}
              onChange={(e) => setReceived(Number(e.target.value))}
            />
            <InputBox
              LabelName="Due Amount"
              Name="dueAmount"
              Value={dueAmount.toFixed(2)}
            />
          </div>
        </div>

        <div className="flex justify-center items-center lg:gap-10 gap-2 lg:flex-row flex-col">
          <Button
            Label="Generate Estimate"
            className="w-full lg:w-fit"
            type="submit"
          />
          <Button
            type="reset"
            Label="Cancel"
            onClick={onCancel}
            className="w-full lg:w-fit hover:bg-red-500"
          />
        </div>
      </form>
    </div>
  );
};

export default LoadingUI(Estimate_form);
