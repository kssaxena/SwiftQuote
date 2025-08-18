import React, { useRef, useState } from "react";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import LoadingUI from "../../components/LoadingUI";
import { FetchData } from "../../utils/FetchFromApi";
import { parseErrorMessage } from "../../utils/ErrorMessageParser";
import { addUser, clearUser } from "../../utils/slice/UserInfoSlice";
import { useDispatch } from "react-redux";

const Login = ({ startLoading, stopLoading }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const handleHome = () => {
    navigate("/");
    window.location.reload();
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
      const response = await FetchData(`users/login`, "post", formData);
      console.log(response);
      if (response.data.success) {
        alert("Logged In successfully");
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
        handleHome();
        // alert(response.data.data.message);
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
    <div>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-3xl"
      >
        {/* Personal Details */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Login</h3>

          <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
            <div className="flex-1 mb-4 md:mb-0">
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

        <div className="flex gap-5 w-full justify-evenly flex-col items-end ">
          <Button Label="Login" type="submit" className={` w-full`} />
          <Button
            Label="Cancel"
            onClick={() => window.location.reload()}
            className={`hover:bg-red-600 w-full`}
          />
        </div>
      </form>
    </div>
  );
};

export default LoadingUI(Login);
