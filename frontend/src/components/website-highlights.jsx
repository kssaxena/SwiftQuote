// src/components/BillingHighlights.jsx

import React from "react";
import {
  FaMoneyBillWave,
  FaLock,
  FaUsers,
  FaChartLine,
  FaFileInvoice,
  FaBell,
} from "react-icons/fa";

const features = [
  {
    icon: <FaFileInvoice className="text-indigo-600 text-3xl" />,
    title: "Easy Invoice Generation",
    description:
      "Create and send professional invoices in seconds with customizable templates.",
  },
  {
    icon: <FaBell className="text-indigo-600 text-3xl" />,
    title: "Automated Reminders",
    description:
      "Send automatic payment reminders via email or SMS to reduce delays.",
  },
  {
    icon: <FaMoneyBillWave className="text-indigo-600 text-3xl" />,
    title: "Multiple Payment Options",
    description:
      "Support for cards, UPI, PayPal, Stripe, and more for fast payments.",
  },
  {
    icon: <FaChartLine className="text-indigo-600 text-3xl" />,
    title: "Real-Time Reports",
    description:
      "Visualize revenue, taxes, and outstanding payments with live analytics.",
  },
  {
    icon: <FaUsers className="text-indigo-600 text-3xl" />,
    title: "Client Management",
    description:
      "Easily manage clients, billing history, and communication all in one place.",
  },
  {
    icon: <FaLock className="text-indigo-600 text-3xl" />,
    title: "Secure & Compliant",
    description:
      "Your data is encrypted and compliant with global tax and privacy laws.",
  },
];

const BillingHighlights = () => {
  return (
    <section className="bg-white py-16 px-4 md:px-10 lg:px-20">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">
          Why Choose Our Billing Platform?
        </h2>
        <p className="text-gray-500 mb-12">
          Streamline your invoicing, automate payments, and manage clients
          effortlessly.
        </p>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BillingHighlights;
