import React from "react";
import { Card, Select } from "antd";

const SelectControls = ({
  value,
  onChange,
  options = [],
  placeholder = "Option",
}) => {
  return (
    <>
      <Select
     className="big-select"
        value={value}
        onChange={(val) => {
          if (typeof onChange === "function") onChange(val);
        }}
        placeholder={placeholder}
        allowClear={false} // cleared option removed
        style={{ width: "calc(100% - 32px)" }}
        options={options}
      /></>
    
    
  );
};
export default SelectControls;
