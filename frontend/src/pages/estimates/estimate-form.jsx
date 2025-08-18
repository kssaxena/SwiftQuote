import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import InputBox from "../../components/Input";
import Button from "../../components/Button";
import { createEstimate } from "../../utils/slice/EstimateSlice";

const EstimateForm = ({ onCancel }) => {
  const formRef = useRef();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.UserInfo.user[0]);

  const [items, setItems] = useState([
    { description: "", qty: 1, rate: 0, size: "", amount: 0 },
  ]);

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    if (field === "qty" || field === "rate") {
      updatedItems[index].amount =
        updatedItems[index].qty * updatedItems[index].rate;
    }
    setItems(updatedItems);
  };

  const addItem = () =>
    setItems([
      ...items,
      { description: "", qty: 1, rate: 0, size: "", amount: 0 },
    ]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    formData.append("items", JSON.stringify(items));
    dispatch(createEstimate({ userId: user._id, formData }));
    if (onCancel) onCancel();
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full">
      <h2 className="text-xl font-bold mb-4">Create New Estimate</h2>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        {/* customer details  */}
        <div className="flex flex-col justify-center items-start border rounded-xl p-5">
          <h3 className="font-semibold">Customer Details</h3>
          <div className="flex justify-between items-center w-full gap-2 ">
            <InputBox
              LabelName="Customer Name"
              Name="customerName"
              Type="text"
            />
            <InputBox
              LabelName="Customer Address"
              Name="customerAddress"
              Type="text"
            />
            <InputBox
              LabelName="Customer Phone"
              Name="customerPhone"
              Type="text"
            />
            <InputBox
              LabelName="Customer State"
              Name="customerState"
              Type="text"
            />
          </div>
        </div>
        {/* estimate details  */}
        <div className="flex flex-col justify-center items-start border rounded-xl p-5">
          <h3 className="font-semibold">Estimate Details</h3>
          <div className="flex justify-between items-center w-full gap-2 ">
            <InputBox
              LabelName="Estimate Number"
              Name="estimateNumber"
              Placeholder="EST-001"
              Type="text"
            />
            <InputBox
              LabelName="Reference No"
              Name="referenceNo"
              Placeholder="Reference..."
              Type="text"
            />
            <InputBox LabelName="Valid Until" Name="validUntil" Type="date" />
          </div>
        </div>

        <h3 className="font-semibold">Items</h3>
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-end mb-2 bg-neutral-200 p-2 rounded-xl ">
            <InputBox
              LabelName="Description"
              Value={item.description}
              onChange={(e) =>
                handleItemChange(index, "description", e.target.value)
              }
            />
            <InputBox
              LabelName="Qty"
              Type="number"
              Value={item.qty}
              onChange={(e) => handleItemChange(index, "qty", +e.target.value)}
            />
            <InputBox
              LabelName="Size"
              Value={item.size}
              onChange={(e) => handleItemChange(index, "size", e.target.value)}
              Type="text"
            />
            <InputBox
              LabelName="Rate"
              Type="number"
              Value={item.rate}
              onChange={(e) => handleItemChange(index, "rate", +e.target.value)}
            />
            <InputBox LabelName="Amount" Value={item.amount} DisableRequired />
            <Button type="button" Label="✕" onClick={() => removeItem(index)} />
          </div>
        ))}
        <Button type="button" Label="+ Add Item" onClick={addItem} />

        <div className="flex justify-end gap-4 mt-4">
          <Button type="button" Label="Cancel" onClick={onCancel} />
          <Button type="submit" Label="Create Estimate" />
        </div>
      </form>
    </div>
  );
};

export default EstimateForm;
