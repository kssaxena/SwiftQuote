import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchInvoiceById } from "../../utils/slice/InvoiceSlice";
import InputBox from "../../components/Input";
import Button from "../../components/Button";

const CurrentInvoice = () => {
  const { invoiceId } = useParams();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.UserInfo.user[0]);
  const { currentInvoice, loading, error } = useSelector(
    (state) => state.Invoices
  );
  const currentProducts = currentInvoice?.items;
  console.log(user);

  useEffect(() => {
    if (invoiceId) {
      dispatch(fetchInvoiceById(invoiceId));
    }
  }, [invoiceId, dispatch]);

  // extras
  //   const dispatch = useDispatch();

  //   const handleUpdateInvoice = (invoiceId) => {
  //     const formData = new FormData(formRef.current);
  //     formData.append("items", JSON.stringify(items));

  //     dispatch(updateInvoice({ invoiceId, formData }));
  //   };

  return (
    <div className="py-20 w-full ">
      <div className="flex flex-col justify-center items-center gap-5 py-5">
        <div className="flex justify-start items-center w-[90%] gap-5">
          <h2 className="text-xl font-semibold">Invoice Id: {invoiceId}</h2>
          <Button Label="Print" />
          <Button Label="Edit" />
        </div>
        {/* this is the section below which is displaying the details of the company  */}
        <div className="w-[90%]">
          <div className="space-y-3 border p-4 rounded-lg shadow w-full">
            <h3 className="text-lg font-semibold">Company Details</h3>
            <div className="flex justify-center items-center gap-2">
              <InputBox
                LabelName="Business Name"
                Type="text"
                Placeholder="Enter Customer Name"
                Name="customerName"
                Value={user?.businessName}
                DisableRequired={true}
              />

              <InputBox
                LabelName="Business Address"
                Type="text"
                Placeholder="Enter Address"
                Name="customerAddress"
                Value={user?.businessAddress}
                DisableRequired={true}
              />
              <InputBox
                LabelName="Business Address State"
                Type="text"
                Placeholder="Enter Address"
                Name="customerAddress"
                Value={user?.businessState}
                DisableRequired={true}
              />

              <InputBox
                LabelName="G.S.T. Number"
                Type="text"
                Placeholder="Enter State Name & Code"
                Name="customerState"
                Value={user?.gstNumber}
                DisableRequired={true}
              />
              <InputBox
                LabelName="Business Number"
                Type="number"
                Placeholder="Enter Phone Number"
                Name="customerPhone"
                Value={user?.businessContact}
                DisableRequired={true}
              />
              <InputBox
                LabelName="Business Email"
                Type="text"
                Placeholder="Enter State Name & Code"
                Name="customerState"
                Value={user?.businessEmail}
                DisableRequired={true}
              />
            </div>
          </div>
        </div>
        {/* this is the section below which is displaying the details of the invoice  */}
        <section className="space-y-6 w-[90%]">
          <div className="flex lg:gap-5 gap-2 lg:flex-row flex-col">
            {/* ---------- Customer Details ---------- */}
            <div className="space-y-3 border p-4 rounded-lg shadow w-full">
              <h3 className="text-lg font-semibold">Customer Details</h3>
              <div className="flex justify-center items-center gap-2">
                <InputBox
                  LabelName="Customer Name"
                  Type="text"
                  Placeholder="Enter Customer Name"
                  Name="customerName"
                  Value={currentInvoice?.customerName}
                  DisableRequired={true}
                />

                <InputBox
                  LabelName="Address"
                  Type="text"
                  Placeholder="Enter Address"
                  Name="customerAddress"
                  Value={currentInvoice?.customerAddress}
                  DisableRequired={true}
                />

                <InputBox
                  LabelName="Phone Number"
                  Type="number"
                  Placeholder="Enter Phone Number"
                  Name="customerPhone"
                  Value={currentInvoice?.customerPhone}
                  DisableRequired={true}
                />

                <InputBox
                  LabelName="State Name & Code"
                  Type="text"
                  Placeholder="Enter State Name & Code"
                  Name="customerState"
                  Value={currentInvoice?.customerState}
                  DisableRequired={true}
                />
              </div>
            </div>
            {/* ---------- Invoice Details ---------- */}
          </div>
          <div className="space-y-3 border p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Invoice Details</h3>

            <div className="flex justify-center items-center gap-2">
              <InputBox
                LabelName="Invoice Number"
                Type="text"
                Placeholder="Enter Invoice Number / Estimate No."
                Name="invoiceNumber"
                Value={currentInvoice?.invoiceNumber}
                DisableRequired={true}
              />

              <InputBox
                LabelName="Invoice Date (MM.DD.YY)"
                // Type="date"
                Placeholder="Select Invoice Date"
                Name="invoiceDate"
                Value={new Date(currentInvoice?.createdAt).toLocaleDateString()}
                DisableRequired={true}
              />

              <InputBox
                LabelName="Reference No. & Date"
                Type="text"
                Placeholder="Enter Reference No. & Date"
                Name="referenceNo"
                Value={currentInvoice?.referenceNo}
                DisableRequired={true}
              />

              <InputBox
                LabelName="Buyer's Order No."
                Type="text"
                Placeholder="Enter Buyer's Order No."
                Name="buyerOrderNo"
                Value={currentInvoice?.buyerOrderNo}
                DisableRequired={true}
              />
            </div>

            <div className="flex justify-center items-center gap-2">
              <InputBox
                LabelName="Dispatch Document No."
                Type="text"
                Placeholder="Enter Dispatch Document No."
                Name="dispatchDocNo"
                Value={currentInvoice?.dispatchDocNo}
                DisableRequired={true}
              />

              <InputBox
                LabelName="Delivery Note"
                Type="text"
                Placeholder="Enter Delivery Note"
                Name="deliveryNote"
                Value={currentInvoice?.deliveryNote}
                DisableRequired={true}
              />

              <InputBox
                LabelName="Destination"
                Type="text"
                Placeholder="Enter Destination"
                Name="destination"
                Value={currentInvoice?.destination}
                DisableRequired={true}
              />

              <InputBox
                LabelName="Mode/Terms of Payment"
                Type="text"
                Placeholder="Enter Mode/Terms of Payment"
                Name="paymentTerms"
                Value={currentInvoice?.paymentTerms}
                DisableRequired={true}
              />
            </div>
          </div>

          <div className="flex lg:gap-5 gap-2 flex-col">
            {/* ---------- Goods / Items Section ---------- */}
            <div className="space-y-3 border p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Goods / Items</h3>

              {currentProducts?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center rounded-xl gap-2"
                >
                  <InputBox
                    className="w-fit"
                    LabelName="Description"
                    Placeholder="Item Name and Description"
                    Name={`description-${index}`}
                    Value={item.description}
                    DisableRequired={true}
                  />
                  <div className="flex justify-center items-center gap-2">
                    <InputBox
                      LabelName="Size"
                      Placeholder="Size"
                      Name={`size-${index}`}
                      Value={item.size}
                      DisableRequired={true}
                    />
                    <InputBox
                      LabelName="Qty"
                      Type="number"
                      Placeholder="Qty"
                      Name={`qty-${index}`}
                      Value={item.qty}
                      DisableRequired={true}
                    />
                    <InputBox
                      LabelName="Rate"
                      Type="number"
                      Placeholder="Rate"
                      Name={`rate-${index}`}
                      Value={item.rate}
                      DisableRequired={true}
                    />
                    <InputBox
                      LabelName="Amount"
                      Type="number"
                      Placeholder="Amount"
                      Name={`amount-${index}`}
                      Value={item.amount}
                      DisableRequired={true}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ---------- Tax & Summary Section ---------- */}
            <div className="border p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Tax & Summary</h3>

              <div className="flex gap-2 ">
                <InputBox
                  LabelName="Total (incl. tax)"
                  Name="billingAmount"
                  Value={currentInvoice?.billingAmount}
                  DisableRequired={true}
                />
                <InputBox
                  LabelName={"Taxable Value"}
                  Value={currentInvoice?.taxableValue}
                  DisableRequired={true}
                  Name={"taxableValue"}
                />
                <InputBox
                  LabelName={" SGST (9%)"}
                  Value={currentInvoice?.sgstValue}
                  DisableRequired={true}
                  Name={"sgstValue"}
                />
                <InputBox
                  LabelName={"CGST (9%)"}
                  Value={currentInvoice?.cgstValue}
                  DisableRequired={true}
                  Name={"cgstValue"}
                />
                <InputBox
                  LabelName={" Total Tax"}
                  Value={currentInvoice?.totalTax}
                  DisableRequired={true}
                  Name={"totalTax"}
                />
                <InputBox
                  LabelName="Amount Received"
                  Name="receivedAmount"
                  Value={currentInvoice?.receivedAmount}
                  DisableRequired={true}
                />
                <InputBox
                  LabelName="Due Amount"
                  Name="dueAmount"
                  Value={currentInvoice?.dueAmount}
                  DisableRequired={true}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CurrentInvoice;
