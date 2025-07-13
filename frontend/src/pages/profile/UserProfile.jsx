import React from "react";
import { RiHome2Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { IoPencil } from "react-icons/io5";

const UserProfile = () => {
  const navigate = useNavigate();
  const handleHome = () => {
    navigate("/");
  };
  const personalDetails = {
    name: "Kshitij Saxena",
    email: "kshitij@example.com",
    password: "****************",
    contact: "+91 9876543210",
  };

  const businessDetails = {
    companyName: "Saxena Enterprises",
    gstNumber: "29ABCDE1234F2Z5",
    businessAddress: "Industrial Area, Noida, UP",
    businessContact: "+91 9123456780",
  };

  return (
    <div className="pt-20">
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex justify-start items-center gap-10">
          Profile Details{" "}
          <button onClick={handleHome}>
            <RiHome2Fill className="hover:text-neutral-600 duration-300 ease-in-out hover:cursor-pointer" />
          </button>
        </h1>

        {/* Personal Details */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <div>
              <strong>Name:</strong> {personalDetails.name}
            </div>
            <div>
              <strong>Email:</strong> {personalDetails.email}
            </div>
            <div>
              <strong>Password:</strong> {personalDetails.password}
            </div>
            <div>
              <strong>Contact Number:</strong> {personalDetails.contact}
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Business Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <div>
              <strong>Company Name:</strong> {businessDetails.companyName}
            </div>
            <div>
              <strong>GST Number:</strong> {businessDetails.gstNumber}
            </div>
            <div>
              <strong>Business Address:</strong>{" "}
              {businessDetails.businessAddress}
            </div>
            <div>
              <strong>Business Contact:</strong>{" "}
              {businessDetails.businessContact}
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Templates
          </h2>
          <div className=" gap-4 text-gray-600">
            <div className="flex justify-between items-center bg-neutral-100 p-2 rounded-2xl px-10">
              <div>
                <strong>Template 1:</strong> {businessDetails.companyName}
              </div>
              <div className="gap-5 flex justify-center items-center px-10">
                <button>
                  <IoPencil />
                </button>
                <button>
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
