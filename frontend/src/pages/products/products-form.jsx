// src/pages/products/ProductForm.jsx

import React, { useState, useRef } from "react";
import Button from "../../components/Button";
import InputBox from "../../components/Input";
import LoadingUI from "../../components/LoadingUI";
import { useDispatch, useSelector } from "react-redux";
import { addProduct } from "../../utils/slice/ProductSlice";

const ProductForm = ({ onCancel, startLoading, stopLoading }) => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.UserInfo.user);
  const formRef = useRef();
  const [variants, setVariants] = useState([
    { variantName: "", size: "", color: "", price: 0, stock: 0 },
  ]);

  const handleVariantChange = (i, field, value) => {
    const updated = [...variants];
    updated[i][field] = value;
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { variantName: "", size: "", color: "", price: 0, stock: 0 },
    ]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    formData.append("variants", JSON.stringify(variants));
    console.log("from product form line 39", user[0]?._id);
    // startLoading();
    await dispatch(addProduct({ userId: user[0]?._id, formData }));
    // stopLoading();
    onCancel();
  };

  return (
    <form className="space-y-6 " ref={formRef} onSubmit={submitProduct}>
      <h2 className="text-xl font-semibold">Add Product</h2>

      <div className="border p-4 rounded-lg shadow space-y-3">
        <InputBox
          LabelName="Product Name *"
          Name="name"
          Type="text"
          Placeholder="ABC Door"
        />
        <InputBox
          LabelName="Category"
          Name="category"
          Placeholder="Furniture / Door"
        />
        <InputBox
          LabelName="Description"
          Name="description"
          Placeholder="Product Details"
        />
        <InputBox LabelName="Upload Image" Type="file" Name="image" />
      </div>

      <div className="border p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Variants</h3>

        {variants.map((v, i) => (
          <div key={i} className="bg-neutral-300 p-2 rounded-xl space-y-2">
            <InputBox
              LabelName="Variant Name"
              Value={v.variantName}
              onChange={(e) =>
                handleVariantChange(i, "variantName", e.target.value)
              }
            />
            <div className="flex flex-col lg:flex-row">
              <InputBox
                LabelName="Size"
                Value={v.size}
                onChange={(e) => handleVariantChange(i, "size", e.target.value)}
              />
              <InputBox
                LabelName="Color"
                Value={v.color}
                onChange={(e) =>
                  handleVariantChange(i, "color", e.target.value)
                }
              />
              <InputBox
                LabelName="Price"
                Type="number"
                Value={v.price}
                onChange={(e) =>
                  handleVariantChange(i, "price", e.target.value)
                }
              />
              <InputBox
                LabelName="Stock"
                Type="number"
                Value={v.stock}
                onChange={(e) =>
                  handleVariantChange(i, "stock", e.target.value)
                }
              />
            </div>
            <Button
              Label="✕"
              onClick={() => removeVariant(i)}
              className="hover:bg-red-600"
            />
          </div>
        ))}

        <Button type="button" onClick={addVariant} Label="+ Add Variant" />
      </div>

      <div className="flex justify-center items-center gap-2">
        <Button
          Label="Save Product"
          type="submit"
          className="w-full lg:w-fit"
        />
        <Button
          Label="Cancel"
          onClick={onCancel}
          className="w-full lg:w-fit hover:bg-red-500"
        />
      </div>
    </form>
  );
};

export default LoadingUI(ProductForm);
