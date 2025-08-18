import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchEstimateById,
  updateEstimate,
} from "../../utils/slice/EstimateSlice";
import { useReactToPrint } from "react-to-print";
import Button from "../../components/Button";
import InputBox from "../../components/Input";

const CurrentEstimate = () => {
  const { estimateId } = useParams();
  const dispatch = useDispatch();
  const { currentEstimate, loading } = useSelector((state) => state.Estimates);
  console.log(currentEstimate);
  const user = useSelector((store) => store.UserInfo.user[0]);

  const contentRef = useRef();
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({});
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `Estimate-${currentEstimate?.estimateNumber}`,
  });

  useEffect(() => {
    if (estimateId) {
      dispatch(fetchEstimateById(estimateId));
    }
  }, [estimateId, dispatch]);

  useEffect(() => {
    if (currentEstimate) setEditValues(currentEstimate);
  }, [currentEstimate]);

  const handleUpdate = () => {
    const formData = new FormData();
    Object.keys(editValues).forEach((key) => {
      if (key !== "items") formData.append(key, editValues[key]);
    });
    formData.append("items", JSON.stringify(editValues.items));
    dispatch(updateEstimate({ estimateId, formData }));
    setIsEditing(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="py-20 w-full">
      <div className="flex justify-between items-center px-6">
        <h2 className="text-xl font-semibold">
          Estimate #{currentEstimate?.estimateNumber}
        </h2>
        <div className="flex gap-3">
          <Button Label="Print" onClick={reactToPrintFn} />
          <Button
            Label={isEditing ? "Cancel" : "Edit"}
            onClick={() => setIsEditing(!isEditing)}
          />
          {isEditing && <Button Label="Save" onClick={handleUpdate} />}
        </div>
      </div>

      <div ref={contentRef} className="bg-white shadow-lg rounded-lg p-6 mt-6">
        {isEditing ? (
          <div className="space-y-4">
            <InputBox
              LabelName="Estimate Number"
              Value={editValues.estimateNumber}
              onChange={(e) =>
                setEditValues({ ...editValues, estimateNumber: e.target.value })
              }
            />
            <InputBox
              LabelName="Customer Name"
              Value={editValues.customerName}
              onChange={(e) =>
                setEditValues({ ...editValues, customerName: e.target.value })
              }
            />
            <InputBox
              LabelName="Customer Address"
              Value={editValues.customerAddress}
              onChange={(e) =>
                setEditValues({
                  ...editValues,
                  customerAddress: e.target.value,
                })
              }
            />
            {/* Add more fields here as per your schema */}
          </div>
        ) : (
          <>
            <h3 className="font-semibold">
              Customer: {currentEstimate?.customerName}
            </h3>
            <p>{currentEstimate?.customerAddress}</p>
            <table className="w-full mt-4 border-collapse border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">#</th>
                  <th className="border p-2">Description</th>
                  <th className="border p-2">Qty</th>
                  <th className="border p-2">Rate</th>
                  <th className="border p-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {currentEstimate?.items?.map((item, i) => (
                  <tr key={i}>
                    <td className="border p-2 text-center">{i + 1}</td>
                    <td className="border p-2">{item.description}</td>
                    <td className="border p-2 text-center">{item.qty}</td>
                    <td className="border p-2 text-center">{item.rate}</td>
                    <td className="border p-2 text-right">{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default CurrentEstimate;
