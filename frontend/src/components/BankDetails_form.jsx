// import React, { useRef } from "react";
// import InputBox from "./Input";
// import Button from "./Button";
// import { FetchData } from "../utils/FetchFromApi";
// import { useSelector } from "react-redux";
// import { parseErrorMessage } from "../utils/ErrorMessageParser";
// import LoadingUI from "./LoadingUI";

// const BankDetails_form = ({ onClose, startLoading, stopLoading }) => {
//   const formRef = useRef();
//   const user = useSelector((store) => store.UserInfo.user[0]);
//   const userId = user?._id;

//   const handleSubmit = async () => {
//     const formData = new FormData(formRef.current);
//     for (let [key, value] of formData.entries()) {
//       console.log(`${key}: ${value}`);
//     }
//     try {
//       startLoading();
//       const response = await FetchData(
//         `users/add-bank-detail/${userId}`,
//         "post",
//         formData
//       );
//       console.log(response);
//       alert("Bank Details Added Successfully !");
//       onClose();
//     } catch (err) {
//       console.log(err);
//       alert("wait");
//       alert(parseErrorMessage(response.error));
//     } finally {
//       stopLoading();
//     }
//   };

//   return (
//     <div className="">
//       <form
//         ref={formRef}
//         onSubmit={handleSubmit}
//         className="p-6 bg-white rounded shadow"
//       >
//         <h2 className="text-2xl font-bold text-center">Bank Details</h2>

//         <div className="flex justify-center items-center gap-5">
//           <InputBox
//             LabelName="Account Holder Name"
//             Name="accountHolderName"
//             Placeholder="Enter account holder's name"
//           />

//           <InputBox
//             LabelName="Bank Name"
//             Name="bankName"
//             Placeholder="Enter bank name"
//           />

//           <InputBox
//             LabelName="Account Number"
//             Name="accountNumber"
//             Placeholder="Enter account number"
//             Type="number"
//           />

//           <InputBox
//             LabelName="IFSC Code"
//             Name="ifscCode"
//             Placeholder="Enter IFSC code"
//           />

//           <InputBox
//             LabelName="Branch Name"
//             Name="branchName"
//             Placeholder="Enter branch name"
//           />

//           <InputBox
//             LabelName="UPI ID"
//             Name="upiId"
//             Placeholder="Enter UPI ID (optional)"
//             Required={false}
//           />
//         </div>

//         <div className="flex justify-center mt-6">
//           <Button Label="Submit" type="submit" />
//         </div>
//       </form>
//     </div>
//   );
// };

// export default LoadingUI(BankDetails_form);
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Button from "./Button";
import InputBox from "./Input";
import { FetchData } from "../utils/FetchFromApi";
import { parseErrorMessage } from "../utils/ErrorMessageParser";
import LoadingUI from "./LoadingUI";

const BankDetailsForm = ({ onClose, startLoading, stopLoading }) => {
  const formRef = useRef();
  const user = useSelector((store) => store.UserInfo.user[0]);

  const [account, setAccount] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    upiId: "",
  });

  // 🟢 Fetch existing bank details
  useEffect(() => {
    const getBankDetails = async () => {
      try {
        const response = await FetchData(
          `users/get-bank-detail/${user?._id}`,
          "get"
        );
        if (response?.data?.data) {
          setAccount(response.data.data); // single object
        }
      } catch (err) {
        console.error("Error fetching bank details:", err);
      }
    };
    if (user?._id) getBankDetails();
  }, [user]);

  // Update state when input changes
  const handleChange = (field, value) => {
    setAccount((prev) => ({ ...prev, [field]: value }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      startLoading();
      const formData = new FormData(formRef.current);

      const endpoint = account?._id
        ? `users/update-bank-detail/${user._id}`
        : `users/add-bank-detail/${user._id}`;

      const response = await FetchData(endpoint, "post", formData);
      console.log("Response:", response);
      alert("Bank details saved successfully!");
      if (onClose) onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(parseErrorMessage(err?.response?.data));
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="w-[90%] mx-auto mt-10 p-6 border rounded-lg shadow-md bg-white h-fit">
      <h2 className="text-2xl font-bold mb-4">
        {account?._id ? "Edit Bank Details" : "Add Bank Details"}
      </h2>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <InputBox
            LabelName="Account Holder Name"
            Name="accountHolderName"
            Value={account.accountHolderName}
            onChange={(e) => handleChange("accountHolderName", e.target.value)}
            Placeholder="Enter account holder's name"
          />

          <InputBox
            LabelName="Bank Name"
            Name="bankName"
            Value={account.bankName}
            onChange={(e) => handleChange("bankName", e.target.value)}
            Placeholder="Enter bank name"
          />

          <InputBox
            LabelName="Account Number"
            Name="accountNumber"
            Value={account.accountNumber}
            onChange={(e) => handleChange("accountNumber", e.target.value)}
            Placeholder="Enter account number"
            Type="number"
          />

          <InputBox
            LabelName="IFSC Code"
            Name="ifscCode"
            Value={account.ifscCode}
            onChange={(e) => handleChange("ifscCode", e.target.value)}
            Placeholder="Enter IFSC code"
          />

          <InputBox
            LabelName="Branch Name"
            Name="branchName"
            Value={account.branchName}
            onChange={(e) => handleChange("branchName", e.target.value)}
            Placeholder="Enter branch name"
          />

          <InputBox
            LabelName="UPI ID"
            Name="upiId"
            Value={account.upiId}
            onChange={(e) => handleChange("upiId", e.target.value)}
            Placeholder="Enter UPI ID (optional)"
            Required={false}
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button Label="Save" type="submit" />
        </div>
      </form>
    </div>
  );
};

export default LoadingUI(BankDetailsForm);
