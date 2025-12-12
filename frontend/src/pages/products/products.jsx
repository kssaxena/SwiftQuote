import React, { useEffect, useState } from "react";
import Button from "../../components/Button";
import LoadingUI from "../../components/LoadingUI";
import InputBox from "../../components/Input";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ProductsForm from "./products-form";
import { fetchAllProducts } from "../../utils/slice/ProductSlice";

const Products = ({ startLoading, stopLoading }) => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.UserInfo.user);
  const { products, loading } = useSelector((state) => state.Products.products);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const TableHeaders = ["Product", "Category", "Variants", "Stock", "Action"];

  useEffect(() => {
    dispatch(fetchAllProducts(user[0]?._id));
  }, [user]);

  const filteredProducts = products?.filter((p) =>
    p?.name?.toLowerCase()?.includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col p-5 h-full overflow-scroll no-scrollbar">
      <div className="sticky top-1 w-full bg-neutral-100">
        <div className="flex justify-between items-center w-full gap-4">
          <h1 className="text-2xl font-bold">Products</h1>
          <Button Label="+ Add Product" onClick={() => setShowAddForm(true)} />
        </div>
        <div className="flex justify-end w-full">
          <InputBox
            LabelName={<h1>Search among {products?.length} products</h1>}
            Value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            Placeholder="Search Products"
          />
        </div>
      </div>

      <div className="w-full h-full mt-1">
        <table className="w-full text-sm text-left bg-white rounded-xl shadow-sm overflow-hidden">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              {TableHeaders.map((header, idx) => (
                <th key={idx} className="px-5 py-3 font-medium tracking-wide">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredProducts?.length ? (
              filteredProducts?.map((product) => {
                const totalStock = product.variants.reduce(
                  (sum, v) => sum + v.stock,
                  0
                );

                return (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 transition border-b"
                  >
                    <td className="px-5 py-3 text-[#7E63F4] font-medium">
                      <Link
                        to={`/current-product/${product._id}`}
                        className="hover:underline"
                      >
                        {product?.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">{product?.category}</td>
                    <td className="px-5 py-3">{product?.variants.length}</td>
                    <td className="px-5 py-3 font-semibold">{totalStock}</td>
                    <td className="px-5 py-3">
                      <Link
                        to={`/current-product/${product._id}`}
                        className="bg-blue-100 p-1 px-2 rounded text-blue-700 text-sm"
                      >
                        View / Edit
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={TableHeaders.length}
                  className="px-5 py-6 text-center text-gray-500"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed h-screen w-screen top-0 left-0 bg-white lg:p-20 p-5 z-20 overflow-auto no-scrollbar"
          >
            <ProductsForm onCancel={() => setShowAddForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoadingUI(Products);
