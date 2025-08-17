import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

const faqs = [
  {
    question: "How can I generate an invoice?",
    answer:
      "Simply log in, navigate to the Invoice section, and fill out the required fields. You can then download or email the invoice directly.",
  },
  {
    question: "Can I accept international payments?",
    answer:
      "Yes, our platform supports multiple currencies and international payment gateways like Stripe and PayPal.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Yes, we offer a 14-day free trial with access to all premium features. No credit card required.",
  },
  {
    question: "How secure is my billing data?",
    answer:
      "Your data is encrypted using bank-level security and we comply with GDPR and local regulations.",
  },
  {
    question: "Can I automate recurring invoices?",
    answer:
      "Absolutely. Set up recurring billing and we’ll handle the rest, including reminders and payment tracking.",
  },
];

const FAQItem = ({ question, answer, isOpen, toggle }) => {
  return (
    <motion.div
      layout
      className="border-b border-gray-200 overflow-hidden"
      transition={{ layout: { duration: 0.4, ease: "easeInOut" } }}
    >
      <button
        className="w-full flex justify-between items-center py-4 text-left text-gray-800 font-medium focus:outline-none"
        onClick={toggle}
      >
        <span>{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaChevronDown className="text-gray-500" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-gray-600 pb-4 pr-6"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleIndex = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <section className="bg-white py-16 px-4 md:px-10 lg:px-20 w-full">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-10">
          Frequently Asked Questions
        </h2>

        <motion.div layout className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              toggle={() => toggleIndex(index)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
