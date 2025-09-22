import React, { useRef, useState } from "react";
import InputBox from "../../components/Input";
import Button from "../../components/Button";
import { FetchData } from "../../utils/FetchFromApi";
import { useDispatch, useSelector } from "react-redux";
import LoadingUI from "../../components/LoadingUI";
import { createQuotation } from "../../utils/slice/QuotationSlice";

const QuotationForm = ({ onCancel, startLoading, stopLoading }) => {
  const formRef = useRef();
  const user = useSelector((state) => state.UserInfo.user[0]); // logged-in user
  const dispatch = useDispatch();
  const [items, setItems] = useState([
    { description: "", size: "", color: "", qty: 1, rate: 0, amount: 0 },
  ]);

  // const [quotationData, setQuotationData] = useState({
  //   customerName: "",
  //   customerAddress: "",
  //   customerPhone: "",
  //   customerGST: "",
  //   customerState: "",

  //   quotationNumber: "",
  //   quotationDate: "",
  //   validUntil: "",
  //   referenceNo: "",
  //   buyerOrderNo: "",
  //   deliveryNote: "",
  //   destination: "",
  //   paymentTerms: "",

  //   items: [
  //     { description: "", size: "", color: "", qty: 0, rate: 0, amount: 0 },
  //   ],

  //   billingAmount: 0,
  //   taxableValue: 0,
  //   sgst: 0,
  //   cgst: 0,
  //   totalTax: 0,
  //   receivedAmount: 0,
  //   dueAmount: 0,
  // });

  // Tax & Summary
  const [billingAmount, setBillingAmount] = useState("");
  const [received, setReceived] = useState("");

  // GST rates (example: 9% + 9% = 18%)
  const sgstRate = 9;
  const cgstRate = 9;
  const totalRate = sgstRate + cgstRate;

  // Reverse calculations based on billing amount (incl. tax)
  const taxableValue = billingAmount / (1 + totalRate / 100);
  const sgst = (taxableValue * sgstRate) / 100;
  const cgst = (taxableValue * cgstRate) / 100;
  const totalTax = sgst + cgst;
  const dueAmount = billingAmount - received;

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
  const totalGoodsAmount = items.reduce((sum, item) => sum + item.amount, 0);

  // Submit using FetchData
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      startLoading();
      const formData = new FormData(formRef.current);
      formData.append("items", JSON.stringify(items));
      await dispatch(createQuotation({ userId: user?._id, formData }));
      alert("Quotation created successfully!");
      formRef.current.reset();
      setItems([{ description: "", size: "", qty: 1, rate: 0, amount: 0 }]);
      setBillingAmount("");
      setReceived("");
      onCancel();
    } catch (err) {
      alert(
        err?.payload?.message ||
          "An error occurred while generating the quotation."
      );
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="flex justify-center items-center ">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="rounded-lg space-y-6 flex flex-col justify-center items-center w-full"
      >
        <h2 className="text-xl font-semibold mb-4">Create Quotation</h2>

        {/* Customer Details */}
        <div className="space-y-3 border p-4 rounded-lg shadow w-full">
          <h3 className="text-lg font-semibold flex-col flex ">
            Customer Details{" "}
            <span className="text-xs text-red-600">
              ( * Marked fields are mandatory)
            </span>
          </h3>
          <div className="flex justify-center items-center lg:gap-2 lg:flex-row flex-col">
            <InputBox
              LabelName="Customer Name *"
              Type="text"
              Placeholder="Enter Customer Name"
              Name="customerName"
            />

            <InputBox
              LabelName="Address *"
              Type="text"
              Placeholder="Enter Address"
              Name="customerAddress"
            />

            <InputBox
              LabelName="Phone Number *"
              Type="number"
              Placeholder="Enter Phone Number"
              Name="customerPhone"
            />
            <InputBox
              LabelName="GST Number"
              Type="text"
              Placeholder="Enter GST Number"
              Name="customerGST"
              Required={false}
            />

            <InputBox
              LabelName="State Name & Code *"
              Type="text"
              Placeholder="Enter State Name & Code"
              Name="customerState"
            />
          </div>
        </div>

        {/* Quotation Details */}
        <div className="space-y-3 border p-4 rounded-lg shadow w-full">
          <h3 className="text-lg font-semibold flex flex-col">
            Quotation Details{" "}
            <span className="text-xs text-red-600">
              ( * Marked fields are mandatory)
            </span>
          </h3>
          <div className="flex justify-center items-center lg:gap-2  lg:flex-row flex-col">
            <InputBox
              LabelName="Quotation Number *"
              Type="text"
              Placeholder="Enter Quotation Number / Quotation No."
              Name="quotationNumber"
            />

            <InputBox
              LabelName="Valid from *"
              Type="date"
              Placeholder="Select Quotation Date"
              Name="quotationFromDate"
            />

            <InputBox
              LabelName="Valid upto *"
              Type="date"
              Placeholder="Select Quotation Date"
              Name="quotationUptoDate"
            />

            <InputBox
              LabelName="Subject"
              Type="text"
              Placeholder="Subject of your quotation"
              Name="subject"
            />
          </div>
        </div>

        {/* Items Section */}
        <div className="flex lg:gap-5 gap-2 lg:flex-row flex-col w-full">
          <div className="space-y-3 border p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold flex flex-col">
              Goods / Items{" "}
              <span className="text-xs text-red-600">
                ( ** Marked fields are mandatory)
              </span>
              <span className="text-xs text-red-600 text-justify">
                ( ** Just enter the MRP of the product which is getting quoted,
                rest will be calculated automatically.)
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
                    LabelName="Size (W*H)"
                    Placeholder="Size (W * H)"
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
                    LabelName="Enter the Product MRP *"
                    // Type="number"
                    Placeholder="MRP of Product"
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
            <Button onClick={addItem} type="button" Label="+ Add Item" />
            <div className="text-right font-semibold text-lg mt-4">
              Total Goods Amount: ₹{totalGoodsAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-center items-center lg:gap-10 gap-2 lg:flex-row flex-col">
          <Button
            Label="Generate Quotation"
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
        {/* <Button type="submit" Label="Save Quotation" className="mt-6 w-full" /> */}
      </form>
    </div>
  );
};

export default LoadingUI(QuotationForm);
