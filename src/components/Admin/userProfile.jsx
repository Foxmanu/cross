
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import Date from "../Date/Date";
import Data from "../Data/Data";
import SelectControls from "../Home/Select";
import { Layout, theme, Card } from "antd";
import axios from "axios";
import { getApiEndpoint, userDate,gates } from "../../utils/apiConfig";

const { Content } = Layout;

const UserProfile = () => {
  const [data, setData] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [activeLearningOption, setActiveLearningOption] = useState(undefined);
  const [gateOptions, setGateOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    token: { borderRadiusLG },
  } = theme.useToken();
const fetchFromBackend = async (dates, option) => {
  await userDate(option, dates,setLoading,setData);
}

 
  useEffect(() => {
    gates(setGateOptions,activeLearningOption,setActiveLearningOption,);
    console.log("Gate Options:", gateOptions);
    
  }, []);

  useEffect(() => {
    if (gateOptions.length === 0) return;

    if (!activeLearningOption && gateOptions.length > 0) {
      const firstVal = gateOptions[0].value;
      setActiveLearningOption(firstVal);

      if (dateRange?.startDate && dateRange?.endDate) {
        fetchFromBackend(dateRange, firstVal);
      }
    }
  }, [gateOptions]);

  useEffect(() => {
    if (activeLearningOption && dateRange?.startDate && dateRange?.endDate) {
      fetchFromBackend(dateRange, activeLearningOption);
    }
  }, [activeLearningOption, dateRange]);

  const handleSelectChange = (val) => {
    setActiveLearningOption(val);
    fetchFromBackend(dateRange, val);
  };

  return (
    <>
      <div
        style={{
          // paddingTop: 4,
          textAlign: "center",
          borderRadius: borderRadiusLG,
        }}
      >
        <Date fetchFromBackend={fetchFromBackend} setDateRange={setDateRange} />
      </div>

      <div
        style={{
          // paddingTop: 16,
          textAlign: "center",
          borderRadius: borderRadiusLG,
        }}
      >
        <SelectControls
          value={activeLearningOption}
          onChange={handleSelectChange}
          options={gateOptions}
          placeholder="Choose scope"
        />
      </div>

      <Data
        data={data}
        onRefresh={() => fetchFromBackend(dateRange, activeLearningOption)}
      />
    </>
  );
};

export default UserProfile;
