const InputBox = ({
  LabelName,
  Placeholder,
  className = "",
  classNameLabel = "",
  Type = "text",
  Name,
  Value,
  onChange,
  DisableRequired = false,
  Required = true,
  Min,
  Max,
  pattern,
  maxLength,
  title,
  onKeyPress,
}) => {
  return (
    <div className="flex justify-center items-center w-full">
      <div className="py-4 w-full">
        <label
          htmlFor={Name}
          className={`block text-sm font-medium text-gray-700 mb-2 ${classNameLabel}`}
        >
          {LabelName}
        </label>
        <input
          id={Name}
          name={Name}
          type={Type}
          value={Value}
          onChange={!DisableRequired ? onChange : undefined}
          placeholder={Placeholder}
          required={Required}
          disabled={DisableRequired}
          min={Min}
          max={Max}
          pattern={pattern}
          maxLength={maxLength}
          title={title}
          onKeyPress={onKeyPress}
          className={`w-full px-4 py-2 border rounded-md outline-none transition duration-200 ease-in-out 
            ${
              DisableRequired
                ? "bg-gray-200 cursor-not-allowed"
                : "text-gray-700 bg-white border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 hover:shadow-md"
            } 
            ${className}`}
        />
      </div>
    </div>
  );
};

export default InputBox;
