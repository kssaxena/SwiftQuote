import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import LoadingUI from "./LoadingUI";
import Button from "./Button";
import { FaPlus } from "react-icons/fa";

const CreateTemplate = ({ startLoading, stopLoading }) => {
  const [templateName, setTemplateName] = useState("");
  const formRef = useRef();
  const user = useSelector((store) => store.UserInfo.user);
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({
    label: "",
    key: "",
    type: "text",
    required: false,
  });

  const handleAddField = () => {
    if (!newField.label || !newField.key) return;

    setFields([...fields, newField]);
    setNewField({ label: "", key: "", type: "text", required: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(formRef.current);

    try {
      startLoading();

      const response = await FetchData(
        `users/templates/create`, // API endpoint
        "post",
        formData,
        true // indicates multipart/form-data
      );

      console.log(response);

      if (response.data.success) {
        alert("Template created successfully!");
        setTemplateName("");
        setFields([]);
      } else {
        setError("Failed to create template.");
      }
    } catch (error) {
      alert(parseErrorMessage(error?.response?.data));
      setError(error?.response?.data?.message || "Failed to create template.");
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="w-fit mx-auto mt-10 p-6 border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Template</h2>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Template Name</label>
          <input
            name=""
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            required
          />
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-2">Add Custom Fields</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Label"
              className="flex-1 border px-2 py-1 rounded"
              value={newField.label}
              onChange={(e) =>
                setNewField({ ...newField, label: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Key (e.g. customerName)"
              className="flex-1 border px-2 py-1 rounded"
              value={newField.key}
              onChange={(e) =>
                setNewField({ ...newField, key: e.target.value })
              }
            />
            <select
              className="border px-2 py-1 rounded"
              value={newField.type}
              onChange={(e) =>
                setNewField({ ...newField, type: e.target.value })
              }
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
            </select>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={newField.required}
                onChange={(e) =>
                  setNewField({ ...newField, required: e.target.checked })
                }
              />
              Required
            </label>
            <Button
              Label={
                <h1 className="text-xs flex justify-center items-center gap-2">
                  <FaPlus />
                  Add
                </h1>
              }
            />
          </div>
        </div>

        {fields.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Fields Preview</h4>
            <ul className="list-disc ml-5">
              {fields.map((field, idx) => (
                <li key={idx}>
                  {field.label} ({field.type}) {field.required && "*"}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button type="submit" Label="Create Template" />

        {/* <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded mt-4"
        >
          Create Template
        </button> */}
      </form>
    </div>
  );
};

export default LoadingUI(CreateTemplate);
