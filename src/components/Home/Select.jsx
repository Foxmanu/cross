import React from "react";
import { Card, Select } from "antd";

const SelectControls = ({
  value,
  onChange,
  options = [],
  placeholder = "Option",
}) => {
  return (
    <Card
      // className="select-card custom-card"
      style={{ padding: "16px", margin: "0px 15px" }}
    >
      <Select
        // className="fullwidth-select"
        value={value}
        onChange={(val) => {
          if (typeof onChange === "function") onChange(val);
        }}
        placeholder={placeholder}
        allowClear={false} // cleared option removed
        style={{ width: "calc(100% - 32px)" }}
        options={options}
      />
    </Card>
  );
};
export default SelectControls;
