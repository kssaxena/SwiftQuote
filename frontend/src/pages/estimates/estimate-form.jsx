// import React, { useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import InputBox from "../../components/Input";
// import Button from "../../components/Button";
// import { createEstimate } from "../../utils/slice/EstimateSlice";

// const EstimateForm = ({ onCancel }) => {
//   const formRef = useRef();
//   const dispatch = useDispatch();
//   const user = useSelector((store) => store.UserInfo.user[0]);

//   const [items, setItems] = useState([
//     { description: "", qty: 1, rate: 0, size: "", amount: 0 },
//   ]);

//   // Handle item changes
//   const handleItemChange = (index, field, value) => {
//     const updatedItems = [...items];
//     updatedItems[index][field] = value;
//     if (field === "qty" || field === "rate") {
//       updatedItems[index].amount =
//         updatedItems[index].qty * updatedItems[index].rate;
//     }
//     setItems(updatedItems);
//   };

//   const addItem = () =>
//     setItems([
//       ...items,
//       { description: "", qty: 1, rate: 0, size: "", amount: 0 },
//     ]);
//   const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const formData = new FormData(formRef.current);
//     formData.append("items", JSON.stringify(items));
//     dispatch(createEstimate({ userId: user._id, formData }));
//     if (onCancel) onCancel();
//   };

//   return (
//     <div className="bg-white shadow-md rounded-lg p-6 w-full">
//       <h2 className="text-xl font-bold mb-4">Create New Estimate</h2>
//       <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
//         {/* customer details  */}
//         <div className="flex flex-col justify-center items-start border rounded-xl p-5">
//           <h3 className="font-semibold">Customer Details</h3>
//           <div className="flex justify-between items-center w-full gap-2 ">
//             <InputBox
//               LabelName="Customer Name"
//               Name="customerName"
//               Type="text"
//             />
//             <InputBox
//               LabelName="Customer Address"
//               Name="customerAddress"
//               Type="text"
//             />
//             <InputBox
//               LabelName="Customer Phone"
//               Name="customerPhone"
//               Type="text"
//             />
//             <InputBox
//               LabelName="Customer State"
//               Name="customerState"
//               Type="text"
//             />
//           </div>
//         </div>
//         {/* estimate details  */}
//         <div className="flex flex-col justify-center items-start border rounded-xl p-5">
//           <h3 className="font-semibold">Estimate Details</h3>
//           <div className="flex justify-between items-center w-full gap-2 ">
//             <InputBox
//               LabelName="Estimate Number"
//               Name="estimateNumber"
//               Placeholder="EST-001"
//               Type="text"
//             />
//             <InputBox
//               LabelName="Reference No"
//               Name="referenceNo"
//               Placeholder="Reference..."
//               Type="text"
//             />
//             <InputBox LabelName="Valid Until" Name="validUntil" Type="date" />
//           </div>
//         </div>

//         <h3 className="font-semibold">Items</h3>
//         {items.map((item, index) => (
//           <div key={index} className="flex gap-2 items-end mb-2 bg-neutral-200 p-2 rounded-xl ">
//             <InputBox
//               LabelName="Description"
//               Value={item.description}
//               onChange={(e) =>
//                 handleItemChange(index, "description", e.target.value)
//               }
//             />
//             <InputBox
//               LabelName="Qty"
//               Type="number"
//               Value={item.qty}
//               onChange={(e) => handleItemChange(index, "qty", +e.target.value)}
//             />
//             <InputBox
//               LabelName="Size"
//               Value={item.size}
//               onChange={(e) => handleItemChange(index, "size", e.target.value)}
//               Type="text"
//             />
//             <InputBox
//               LabelName="Rate"
//               Type="number"
//               Value={item.rate}
//               onChange={(e) => handleItemChange(index, "rate", +e.target.value)}
//             />
//             <InputBox LabelName="Amount" Value={item.amount} DisableRequired />
//             <Button type="button" Label="✕" onClick={() => removeItem(index)} />
//           </div>
//         ))}
//         <Button type="button" Label="+ Add Item" onClick={addItem} />

//         <div className="flex justify-end gap-4 mt-4">
//           <Button type="button" Label="Cancel" onClick={onCancel} />
//           <Button type="submit" Label="Create Estimate" />
//         </div>
//       </form>
//     </div>
//   );
// };

// export default EstimateForm;
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
        className="space-y-6"
        ref={formRef}
        onSubmit={handleGenerateEstimate}
      >
        <h2 className="text-xl font-semibold">Estimate Form</h2>

        {/* Customer Details */}
        <div className="space-y-3 border p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Customer Details *</h3>
          <div className="flex gap-2">
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

        {/* Estimate Details */}
        <div className="space-y-3 border p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Estimate Details *</h3>
          <div className="flex flex-col justify-center items-center  gap-2">
            <div className="flex justify-evenly items-center w-full gap-2">
              <InputBox LabelName="Estimate Number *" Name="estimateNumber" />
              <InputBox
                LabelName="Estimate Date *"
                Type="date"
                Name="estimateDate"
              />
              <InputBox
                LabelName="Valid Until *"
                Type="date"
                Name="validUntil"
              />

              <InputBox LabelName="Destination *" Name="destination" />
              <InputBox LabelName="Mode of Payment *" Name="paymentTerms" />
            </div>
            <div className="flex justify-evenly items-center w-full gap-2">
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
        </div>

        <div className="flex justify-center items-start gap-5 w-full">
          {/* Items */}
          <div className="space-y-3 border p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Goods / Items</h3>
            {items.map((item, index) => (
              <div key={index} className="bg-neutral-300 p-2 rounded-lg">
                <InputBox
                  LabelName="Description *"
                  Name={`description-${index}`}
                  Value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                />
                <div className="flex gap-2">
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
            <div className="text-right font-semibold">
              Total Goods Amount: ₹{totalGoodsAmount.toFixed(2)}
            </div>
          </div>

          {/* Tax & Summary */}
          <div className="border p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Tax & Summary</h3>
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

        <div className="flex  w-full justify-center items-center gap-10">
          <Button Label="Generate Estimate" type="submit" />
          <Button
            type={"reset"}
            Label="Cancel"
            onClick={onCancel}
            className="hover:bg-red-500"
          />
        </div>
      </form>
    </div>
  );
};

export default LoadingUI(Estimate_form);
