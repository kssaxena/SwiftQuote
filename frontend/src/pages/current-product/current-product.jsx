import React, { useEffect, useState } from "react";
import InputBox from "../../components/Input";
import Button from "../../components/Button";
import LoadingUI from "../../components/LoadingUI";
import { MdAdd, MdRemove, MdCurrencyRupee } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllProducts,
  updateProduct,
  deleteVariant,
  addVariant,
  updateVariantStock,
} from "../../utils/slice/ProductSlice";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CurrentProduct = ({ startLoading, stopLoading }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.Products);

  const [product, setProduct] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [newStockValue, setNewStockValue] = useState("");

  const [newVariant, setNewVariant] = useState({
    variantName: "",
    size: "",
    color: "",
    price: "",
    stock: "",
  });

  useEffect(() => {
    if (!products.length) dispatch(fetchAllProducts());
  }, [dispatch, products]);

  useEffect(() => {
    setProduct(products.find((p) => p._id === id));
  }, [products, id]);

  if (!product)
    return <div className="p-10 text-center text-gray-500">Loading...</div>;

  // 🌟 Update simple product fields
  const handleUpdate = async (field, value) => {
    setProduct({ ...product, [field]: value });

    await dispatch(
      updateProduct({
        id: product._id,
        data: { [field]: value },
      })
    );
  };

  // 🛠 Add Variant
  const handleAddVariant = async () => {
    await dispatch(
      addVariant({
        productId: product._id,
        data: newVariant,
      })
    );
    setNewVariant({
      variantName: "",
      size: "",
      color: "",
      price: "",
      stock: "",
    });
  };

  // 🛠 Inline price edit
  const updateVariantField = async (variantId, field, value) => {
    const newVariants = product.variants.map((v) =>
      v._id === variantId ? { ...v, [field]: value } : v
    );
    setProduct({ ...product, variants: newVariants });

    await dispatch(
      updateProduct({
        id: product._id,
        data: { variants: newVariants },
      })
    );
  };

  // 🔢 Inline Stock +/- Adjust
  const adjustStock = async (variant, amount) => {
    const newStock = variant.stock + amount;
    if (newStock < 0) return;

    await dispatch(
      updateVariantStock({
        productId: product._id,
        variantId: variant._id,
        stock: newStock,
      })
    );
  };

  // 🧾 Modal Manual Stock Change
  const applyStockModal = async () => {
    if (!selectedVariant) return;
    await dispatch(
      updateVariantStock({
        productId: product._id,
        variantId: selectedVariant._id,
        stock: Number(newStockValue),
      })
    );
    setShowStockModal(false);
  };

  return (
    <div className="p-6 space-y-6 w-full overflow-auto no-scrollbar">
      {/* 🔘 Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Details</h1>
        <Button Label="Back" onClick={() => window.history.back()} />
      </div>

      {/* 🖼️ Product Image + Basic */}
      <div className="flex lg:flex-row flex-col gap-5">
        <div className="border p-4 rounded-xl shadow w-full lg:w-1/3 flex flex-col items-center">
          <img
            src={product?.image?.url}
            alt={product?.name}
            className="h-40 rounded-md mb-3 object-contain"
          />
          <Button Label="Change Image" className="w-full" />
        </div>

        <div className="border p-4 rounded-xl shadow w-full space-y-3">
          <InputBox
            LabelName="Product Name"
            Value={product?.name}
            onChange={(e) => handleUpdate("name", e.target.value)}
          />
          <InputBox
            LabelName="Category"
            Value={product?.category}
            onChange={(e) => handleUpdate("category", e.target.value)}
          />
          <InputBox
            LabelName="Description"
            Value={product?.description}
            onChange={(e) => handleUpdate("description", e.target.value)}
          />
        </div>
      </div>

      {/* 📦 Variants List */}
      <div className="border p-4 rounded-xl shadow space-y-3">
        <h2 className="text-xl font-semibold">Variants</h2>

        {product?.variants?.map((variant) => (
          <div key={variant._id} className="bg-neutral-200 rounded-xl p-3">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 items-center">
              <InputBox
                Value={variant.variantName}
                LabelName="Name"
                onChange={(e) =>
                  updateVariantField(variant._id, "variantName", e.target.value)
                }
              />
              <InputBox
                Value={variant.attributes?.size}
                LabelName="Size"
                onChange={(e) =>
                  updateVariantField(variant._id, "attributes", {
                    ...variant.attributes,
                    size: e.target.value,
                  })
                }
              />
              <InputBox
                Value={variant.attributes?.color}
                LabelName="Color"
                onChange={(e) =>
                  updateVariantField(variant._id, "attributes", {
                    ...variant.attributes,
                    color: e.target.value,
                  })
                }
              />
              <InputBox
                Value={variant.price}
                LabelName="Price"
                Type="number"
                icon={<MdCurrencyRupee />}
                onChange={(e) =>
                  updateVariantField(
                    variant._id,
                    "price",
                    Number(e.target.value)
                  )
                }
              />

              {/* 📊 Stock with +/- */}
              <div className="flex flex-col">
                <label className="text-sm font-medium">Stock</label>
                <div className="flex gap-2 items-center">
                  <Button
                    Label={<MdRemove />}
                    onClick={() => adjustStock(variant, -1)}
                  />
                  <span className="font-semibold">{variant.stock}</span>
                  <Button
                    Label={<MdAdd />}
                    onClick={() => adjustStock(variant, 1)}
                  />
                </div>
                <Button
                  Label="Edit Manually"
                  className="text-xs mt-1"
                  onClick={() => {
                    setSelectedVariant(variant);
                    setShowStockModal(true);
                  }}
                />
              </div>

              <Button
                Label="Delete"
                className="hover:bg-red-600"
                onClick={() =>
                  dispatch(
                    deleteVariant({
                      productId: product._id,
                      variantId: variant._id,
                    })
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>

      {/* ➕ Add New Variant */}
      <div className="border p-4 rounded-xl shadow space-y-3">
        <h2 className="text-xl font-semibold">Add Variant</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {Object.keys(newVariant).map((key) => (
            <InputBox
              key={key}
              LabelName={key.toUpperCase()}
              Value={newVariant[key]}
              onChange={(e) =>
                setNewVariant({ ...newVariant, [key]: e.target.value })
              }
            />
          ))}
        </div>
        <Button Label="Add Variant" onClick={handleAddVariant} />
      </div>

      {/* 🪟 Stock Modal */}
      <AnimatePresence>
        {showStockModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
          >
            <div className="bg-white p-5 rounded-xl w-80 space-y-3">
              <h2 className="text-lg font-semibold">Update Stock</h2>
              <InputBox
                Type="number"
                Placeholder="Enter Stock"
                Value={newStockValue}
                onChange={(e) => setNewStockValue(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  Label="Save"
                  className="w-full"
                  onClick={applyStockModal}
                />
                <Button
                  Label="Cancel"
                  className="w-full hover:bg-red-500"
                  onClick={() => setShowStockModal(false)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoadingUI(CurrentProduct);
