import React, { useRef, useState } from "react";
import Button from "../../components/Button";
import InputBox from "../../components/Input";
import LoadingUI from "../../components/LoadingUI";
import { useDispatch, useSelector } from "react-redux";
import { FetchData } from "../../utils/FetchFromApi";
import { createInvoice } from "../../utils/slice/InvoiceSlice";

const Bill_form = ({ onCancel, startLoading, stopLoading }) => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.UserInfo.user);
  const formRef = useRef();
  // Goods / Items
  const [items, setItems] = useState([
    { description: "", size: "", color: "", qty: 1, rate: 0, amount: 0 },
  ]);
  // console.log(items);

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

  // inside Bill_form component
  // const handleGenerateInvoice = async (e) => {
  //   e.preventDefault();

  //   try {
  //     // setError("");
  //     // setSuccess("");

  //     const formData = new FormData(formRef.current);

  //     // Add dynamic items array separately so backend can parse them easily
  //     formData.append("items", JSON.stringify(items));

  //     // Debugging – see what’s going to backend
  //     for (var pair of formData.entries()) {
  //       console.log(pair[0] + ", " + pair[1]);
  //     }

  //     startLoading();
  //     const response = await FetchData(
  //       // "invoices/create-invoice",
  //       `users/generate-invoice/${user[0]?._id}`,
  //       "post",
  //       formData
  //       // true // since we’re using FormData
  //     );

  //     console.log(response);
  //     // setSuccess("Invoice generated successfully!");
  //     alert("Invoice generated successfully!");
  //     // optional: reset form + items
  //     formRef.current.reset();
  //     setItems([{ description: "", size: "", qty: 1, rate: 0, amount: 0 }]);
  //     setBillingAmount("");
  //     setReceived("");
  //     onCancel();
  //   } catch (err) {
  //     console.error(err);
  //     alert(
  //       err.response?.data?.message ||
  //         "An error occurred while generating the invoice."
  //     );
  //   } finally {
  //     stopLoading();
  //   }
  // };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData(formRef.current);

      // Add dynamic items array separately so backend can parse them
      formData.append("items", JSON.stringify(items));

      // Debugging
      // for (var pair of formData.entries()) {
      //   console.log(pair[0] + ", " + pair[1]);
      // }

      startLoading();

      await dispatch(createInvoice({ userId: user[0]?._id, formData }));

      alert("Invoice generated successfully!");

      // Reset form + states
      formRef.current.reset();
      setItems([{ description: "", size: "", qty: 1, rate: 0, amount: 0 }]);
      setBillingAmount("");
      setReceived("");
      onCancel();
    } catch (err) {
      console.error(err);
      alert(
        err?.payload?.message ||
          "An error occurred while generating the invoice."
      );
    } finally {
      stopLoading();
    }
  };

  // const handleCancel = () => {
  //   ();
  //   console.log("before reload");
  //   // window.location.reload();
  // };

  return (
    <div className="flex justify-center items-center ">
      <form
        className="space-y-6 w-screen"
        ref={formRef}
        onSubmit={handleGenerateInvoice}
      >
        <h2 className="text-xl font-semibold">Invoice Form</h2>
        {/* {console.log(user)} */}

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
          {/* ---------- Invoice Details ---------- */}
        </div>
        <div className="space-y-3 border p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold flex flex-col">
            Invoice Details{" "}
            <span className="text-xs text-red-600">
              ( * Marked fields are mandatory)
            </span>
          </h3>

          <div className="flex justify-center items-center lg:gap-2  lg:flex-row flex-col">
            <InputBox
              LabelName="Invoice Number *"
              Type="text"
              Placeholder="Enter Invoice Number / Estimate No."
              Name="invoiceNumber"
            />

            <InputBox
              LabelName="Invoice Date *"
              Type="date"
              Placeholder="Select Invoice Date"
              Name="invoiceDate"
            />

            <InputBox
              LabelName="Reference No. & Date"
              Type="text"
              Placeholder="Enter Reference No. & Date"
              Name="referenceNo"
              Required={false}
            />

            <InputBox
              LabelName="Buyer's Order No."
              Type="text"
              Placeholder="Enter Buyer's Order No."
              Name="buyerOrderNo"
              Required={false}
            />
          </div>

          <div className="flex justify-center items-center lg:gap-2  lg:flex-row flex-col">
            <InputBox
              LabelName="Dispatch Document No."
              Type="text"
              Placeholder="Enter Dispatch Document No."
              Name="dispatchDocNo"
              Required={false}
            />

            <InputBox
              LabelName="Delivery Note"
              Type="text"
              Placeholder="Enter Delivery Note"
              Name="deliveryNote"
              Required={false}
            />

            <InputBox
              LabelName="Destination *"
              Type="text"
              Placeholder="Enter Destination"
              Name="destination"
            />

            <InputBox
              LabelName="Mode of Payment *"
              Type="text"
              Placeholder="Enter Mode/Terms of Payment"
              Name="paymentTerms"
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
                ( ** Just enter the MRP of the product which is getting billed,
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
                    LabelName="Enter the Product MRP *"
                    // Type="number"
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
              // Type="number"
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

              {/* <p>
                : <b>{totalTax.toFixed(2)}</b>
              </p> */}
            </div>

            <InputBox
              LabelName="Amount Received"
              Type="number"
              Placeholder="Enter Amount Received"
              Name="receivedAmount"
              Value={received}
              onChange={(e) => setReceived(Number(e.target.value))}
            />
            <InputBox
              LabelName="Due Amount"
              Placeholder="Due Amount"
              Name="dueAmount"
              Value={dueAmount.toFixed(2)}
            />

            {/* <div className="font-semibold">
              : <b>{dueAmount.toFixed(2)}</b>
            </div> */}
          </div>
        </div>

        <div className="flex justify-center items-center lg:gap-10 gap-2 lg:flex-row flex-col">
          <Button
            Label="Generate Invoice"
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

export default LoadingUI(Bill_form);
