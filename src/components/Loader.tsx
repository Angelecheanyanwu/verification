import React from "react";
import { Bars, LineWave } from "react-loader-spinner";

const Loader = () => {
  return (
    <Bars
      height="40"
      width="40"
      color="#3f9e68"
      ariaLabel="bars-loading"
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
    />
  );
};

export default Loader;
