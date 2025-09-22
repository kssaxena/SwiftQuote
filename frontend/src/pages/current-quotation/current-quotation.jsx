import React from "react";
import LoadingUI from "../../components/LoadingUI";
import { useParams } from "react-router-dom";

const CurrentQuotation = ({ startLoading, stopLoading }) => {
  const { quotationId } = useParams();
  return (
    <div>
      CurrentQuotation <h1 className="pt-40">{quotationId}</h1>
    </div>
  );
};

export default LoadingUI(CurrentQuotation);
