import React from "react";

const Button = ({ Label = "", onClick, className, type }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${className} duration-200 ease-in-out color-purple py-2 px-4 rounded-lg hover:rounded-2xl shadow-xl cursor-pointer text-white hover:text-neutral-100`}
    >
      {Label}
    </button>
  );
};

export default Button;
