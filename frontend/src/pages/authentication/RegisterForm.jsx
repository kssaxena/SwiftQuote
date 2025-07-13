import React, { useRef, useState } from "react";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

const RegistrationForm = () => {
  const navigate = useNavigate();
  const handleHome = () => {
    navigate("/");
  };
  const formRef = useRef();
  //   const formData = new FormData(formRef.current);
  //   for (let [key, value] of formData.entries()) {
  //     console.log(`${key}: ${value}`);
  //   }

  const handleChange = (e) => {
    e.target.value;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-3xl"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Registration Form
        </h2>

        {/* Personal Details */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Personal Details
          </h3>

          <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
            <div className="flex-1 mb-4 md:mb-0">
              <label className="block mb-1 text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                // value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">
                Contact Number
              </label>
              <input
                type="tel"
                name="contact"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                // value={formData.contact}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1 mb-4 md:mb-0">
              <label className="block mb-1 text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                // value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                // value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Business Details
          </h3>

          <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
            <div className="flex-1 mb-4 md:mb-0">
              <label className="block mb-1 text-sm font-medium">
                Business Name
              </label>
              <input
                type="text"
                name="businessName"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                // value={formData.businessName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">
                Business Contact Number
              </label>
              <input
                type="tel"
                name="businessContact"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                // value={formData.businessContact}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1 mb-4 md:mb-0">
              <label className="block mb-1 text-sm font-medium">
                Business Address
              </label>
              <input
                type="text"
                name="businessAddress"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                // value={formData.businessAddress}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">
                Business GST
              </label>
              <input
                type="text"
                name="gstNumber"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                // value={formData.gstNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="flex gap-10 w-full justify-end items-end ">
          <Button Label="Register" type="submit" />
          <Button
            Label="Cancel"
            onClick={handleHome}
            className={`hover:bg-red-600`}
          />
        </div>

        {/* <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Register
        </button> */}
      </form>
    </div>
  );
};

export default RegistrationForm;
