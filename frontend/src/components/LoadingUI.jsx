import React, { useState, useEffect } from "react";

const LoadingUI = (WrappedComponent) => {
  return function WithLoadingComponent(props) {
    const [loading, setLoading] = useState(false);
    const [seconds, setSeconds] = useState(0);

    const startLoading = () => {
      setLoading(true);
      setSeconds(0); // reset countdown when loading starts
    };
    const stopLoading = () => {
      setLoading(false);
      setSeconds(0); // reset when loading stops
    };

    useEffect(() => {
      let timer;
      if (loading) {
        timer = setInterval(() => {
          setSeconds((prev) => prev + 1);
        }, 1000);
      }
      return () => clearInterval(timer);
    }, [loading]);

    return (
      <>
        {loading && (
          <div className="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-white bg-opacity-80 z-50">
            {/* Spinner */}
            <div className="w-12 h-12 border-4 border-[#7E63F4] border-t-transparent rounded-full animate-spin" />

            {/* Countdown message */}
            {seconds >= 5 && (
              <p className="mt-4 text-gray-700 text-sm font-medium animate-pulse">
                It is taking longer than usual, please check your network
                connection...
              </p>
            )}
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
