import React, { useState } from "react";

const LoadingUI = (WrappedComponent) => {
  return function WithLoadingComponent(props) {
    const [loading, setLoading] = useState(false);

    const startLoading = () => setLoading(true);
    const stopLoading = () => setLoading(false);

    return (
      <>
        {loading && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-100 bg-opacity-50 z-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#7E63F4]"></div>
          </div>
        )}
        <WrappedComponent
          {...props}
          startLoading={startLoading}
          stopLoading={stopLoading}
        />
      </>
    );
  };
};

export default LoadingUI;
