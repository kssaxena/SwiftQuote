import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Button from "./Button";
import InputBox from "./Input";
import { FetchData } from "../utils/FetchFromApi";
import { parseErrorMessage } from "../utils/ErrorMessageParser";

const TermsAndConditionsForm = ({ startLoading, stopLoading, onClose }) => {
  const formRef = useRef();
  const user = useSelector((store) => store.UserInfo.user[0]);
  const [items, setItems] = useState([{ description: "" }]);

  // 🟢 Prefill if terms already exist
  useEffect(() => {
    if (user?.termsAndConditions?.descriptions?.length) {
      setItems(
        user.termsAndConditions.descriptions.map((desc) => ({
          description: desc,
        }))
      );
    }
  }, [user]);

  const handleItemChange = (index, value) => {
    const updated = [...items];
    updated[index].description = value;
    setItems(updated);
  };

  const addItem = () => setItems([...items, { description: "" }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      startLoading();
      const formData = new FormData(formRef.current);
      formData.append("items", JSON.stringify(items));

      const endpoint = user?.termsAndConditions
        ? `users/update-terms-condition/${user._id}`
        : `users/add-terms-condition`;

      const response = await FetchData(endpoint, "post", formData);
      console.log("Response:", response);
      alert("Terms & Conditions saved successfully!");
      if (onClose) onClose();
      window.location.reload();
    } catch (err) {
      alert(parseErrorMessage(err?.response?.data));
      console.error(err);
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="w-[90%] mx-auto mt-10 p-6 border rounded-lg shadow-md bg-white h-full overflow-scroll no-scrollbar">
      <h2 className="text-2xl font-bold mb-4 sticky top-0 left-0">
        {user?.termsAndConditions
          ? "Edit Terms and Conditions"
          : "Add Terms and Conditions"}
      </h2>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="flex justify-between sticky top-0 left-0 bg-white shadow-2xl">
          <Button type="button" onClick={addItem} Label="+ Add Point" />
          <Button type="submit" Label="Save" />
        </div>

        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-end gap-3 bg-neutral-200 p-2 rounded-xl"
            >
              <InputBox
                LabelName={`Point ${index + 1}`}
                Placeholder="Write your term..."
                Name={`description-${index}`}
                Value={item.description}
                onChange={(e) => handleItemChange(index, e.target.value)}
              />
              <Button
                type="button"
                Label="✕"
                onClick={() => removeItem(index)}
                className="hover:bg-red-600"
              />
            </div>
          ))}
        </div>
      </form>
    </div>
  );
};

export default TermsAndConditionsForm;
