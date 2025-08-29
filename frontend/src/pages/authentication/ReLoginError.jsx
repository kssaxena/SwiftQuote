import React, { useRef, useState } from "react";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import LoadingUI from "../../components/LoadingUI";
import { FetchData } from "../../utils/FetchFromApi";
import { parseErrorMessage } from "../../utils/ErrorMessageParser";
import { addUser, clearUser } from "../../utils/slice/UserInfoSlice";
import { useDispatch } from "react-redux";
import Login from "./Login";
import BillingHighlights from "../../components/website-highlights";
import FAQSection from "../../components/faqs";
import { AnimatePresence, motion } from "framer-motion";

const ReLoginError = ({ startLoading, stopLoading }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const handleHome = () => {
    navigate("/");
  };
  const Dispatch = useDispatch();
  const formRef = useRef();

  const handleChange = (e) => {
    e.target.value;
  };

  // const HandleAutoLogin = () => {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    //   const formData = new FormData(formRef.current);
    //   for (let [key, value] of formData.entries()) {
    //     console.log(`${key}: ${value}`);
    //   }
    try {
      startLoading();
      const response = await FetchData(
        `users/register`,
        "post",
        formData,
        true
      );
      console.log(response);
      if (response.data.success) {
        alert("Registered successfully");
        localStorage.clear(); // will clear the all the data from localStorage
        localStorage.setItem(
          "AccessToken",
          response.data.data.tokens.AccessToken
        );
        localStorage.setItem(
          "RefreshToken",
          response.data.data.tokens.RefreshToken
        );
        Dispatch(clearUser());
        Dispatch(addUser(response.data.data.user));
        window.location.reload();
        // handleHome();
        alert(response.data.data.message);
      } else {
        setError("Failed to register.");
      }
    } catch (error) {
      alert(parseErrorMessage(error?.response?.data));
      setError(err.response?.data?.message || "Failed to register.");
    } finally {
      stopLoading();
    }
  };

  return (
    <div className=" bg-gray-100 flex items-center justify-center flex-col lg:py-24 pt-24 pb-10 no-scrollbar gap-20">
      <div className="flex flex-col justify-center items-center gap-20 lg:py-40 px-2 py-20">
        <motion.h1
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="uppercase lg:text-4xl text-2xl text-center flex flex-col justify-center items-center gap-5 tracking-widest"
        >
          automate your{" "}
          <motion.span
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            workflow with
          </motion.span>
          <span>
            <motion.h1
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white text-black/80 font-bold text-2xl p-2 rounded-xl select-none w-fit shadow-2xl tracking-normal"
            >
              Swift{" "}
              <span className="color-purple text-white p-1 rounded-xl">
                Quote
              </span>
            </motion.h1>
          </span>
        </motion.h1>
        <div className="gap-20 flex justify-center items-center ">
          <motion.p
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <Button Label="Login" onClick={() => setIsOpen(true)} />
          </motion.p>
          <motion.p
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <Button Label="Get started >" onClick={() => setIsOpen2(true)} />
          </motion.p>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center lg:gap-20">
        <BillingHighlights />
        <FAQSection />
      </div>

      {/* register form  */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-3xl"
      >
        {/* <h1 className="flex justify-center items-center gap-10 w-full">
          Already have an account{" "}
          <Button onClick={() => setIsOpen(true)} Label="Login" />{" "}
        </h1> */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Register here</h2>

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
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">
                Contact Number
              </label>
              <input
                type="number"
                name="contact"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200 no-spinner"
                pattern="\d{10}"
                inputMode="numeric"
                maxLength={10}
                minLength={10}
                title="Contact number must be exactly 10 digits"
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
                pattern="\d{10}"
                inputMode="numeric"
                maxLength={10}
                minLength={10}
                title="Contact number must be exactly 10 digits"
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
                pattern="^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$"
                title="Enter a valid 15-character GST number (e.g. 22AAAAA0000A1Z1)"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1 mb-4 md:mb-0">
              <label className="block mb-1 text-sm font-medium">Email</label>
              <input
                type="text"
                name="businessEmail"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">City</label>
              <input
                type="text"
                name="businessCity"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1 mb-4 md:mb-0">
              <label className="block mb-1 text-sm font-medium">State</label>
              <input
                type="text"
                name="businessState"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">Pin Code</label>
              <input
                type="text"
                name="businessPinCode"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                pattern="^[1-9][0-9]{5}$"
                title="Enter a valid 6-digit Indian PIN code (cannot start with 0)"
                maxLength={6}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium">
              Business Logo
            </label>
            <input
              type="file"
              name="image"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
              onChange={handleChange}
              accept="image/*"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-10 w-full justify-evenly items-end ">
          <Button Label="Register" type="submit" className={`w-full`} />
          <h1 className="flex justify-center items-center gap-10 w-full">
            Already have an account{" "}
            <Button onClick={() => setIsOpen(true)} Label="Login" />{" "}
          </h1>
        </div>
      </form>
      <AnimatePresence>
        {isOpen2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed top-0 left-0 flex flex-col-reverse justify-start items-center w-full h-full backdrop-blur-2xl py-32 overflow-scroll"
          >
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="bg-white p-8 rounded-xl shadow-md w-full max-w-3xl"
            >
              <h1 className="flex justify-center items-center lg:gap-10 gap-5 w-full">
                Already have an account{" "}
                <Button onClick={() => setIsOpen(true)} Label="Login" />{" "}
              </h1>
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
                    <label className="block mb-1 text-sm font-medium">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 text-sm font-medium">
                      Contact Number
                    </label>
                    <input
                      type="number"
                      name="contact"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200 no-spinner"
                      pattern="\d{10}"
                      inputMode="numeric"
                      maxLength={10}
                      minLength={10}
                      title="Contact number must be exactly 10 digits"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:space-x-4">
                  <div className="flex-1 mb-4 md:mb-0">
                    <label className="block mb-1 text-sm font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 text-sm font-medium">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
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
                      pattern="\d{10}"
                      inputMode="numeric"
                      maxLength={10}
                      minLength={10}
                      title="Contact number must be exactly 10 digits"
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
                      pattern="^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$"
                      title="Enter a valid 15-character GST number (e.g. 22AAAAA0000A1Z1)"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:space-x-4">
                  <div className="flex-1 mb-4 md:mb-0">
                    <label className="block mb-1 text-sm font-medium">
                      Email
                    </label>
                    <input
                      type="text"
                      name="businessEmail"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 text-sm font-medium">
                      City
                    </label>
                    <input
                      type="text"
                      name="businessCity"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:space-x-4">
                  <div className="flex-1 mb-4 md:mb-0">
                    <label className="block mb-1 text-sm font-medium">
                      State
                    </label>
                    <input
                      type="text"
                      name="businessState"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 text-sm font-medium">
                      Pin Code
                    </label>
                    <input
                      type="text"
                      name="businessPinCode"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                      pattern="^[1-9][0-9]{5}$"
                      title="Enter a valid 6-digit Indian PIN code (cannot start with 0)"
                      maxLength={6}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">
                    Business Logo
                  </label>
                  <input
                    type="file"
                    name="image"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                    onChange={handleChange}
                    accept="image/*"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-10 w-full justify-evenly items-end ">
                <Button Label="Register" type="submit" className={`w-full`} />
                <h1 className="flex justify-center items-center gap-10 w-full">
                  Already have an account{" "}
                  <Button onClick={() => setIsOpen(true)} Label="Login" />{" "}
                </h1>
              </div>
            </form>
            <Button Label="X" onClick={() => setIsOpen2(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed top-0 left-0 flex justify-center items-center w-full h-full backdrop-blur-2xl"
          >
            <Login />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoadingUI(ReLoginError);
