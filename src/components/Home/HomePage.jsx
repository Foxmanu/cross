import React, { useState, useEffect, use, act } from "react";

import Date from "../Date/Date";
import Data from "../Data/Data";
import SelectControls from "./Select";
import { getApiEndpoint,Logout ,userDate,gates} from "../../utils/apiConfig";
import "./HomePage.css";
import { Layout, theme,Modal } from "antd"; // removed Button, Space
import { LogoutOutlined } from "@ant-design/icons";
import axios from "axios";
import ErrorBoundary from "../ErrorBoundary";




const { Header, Content, Footer } = Layout;

function HomePage({
  username ,
  setUsername ,
  setLoginStatus,
  setStatus,
}) {
  const [data, setData] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [activeLearningOption, setActiveLearningOption] = useState(undefined); // no default
  const [gateOptions, setGateOptions] = useState([]); // options fetched from backend

  const [loading, setLoading] = useState(false);
  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  // Robust logout logic


  
 const handleLogout = async () => {
Logout(username,setUsername,setLoginStatus,setStatus)
};
const fetchFromBackend = async (dates, option) => {
  await userDate(option, dates,setLoading,setData);
}

 
  useEffect(() => {
    gates(setGateOptions,activeLearningOption,setActiveLearningOption,);
    console.log("Gate Options:", gateOptions);
    
  }, []);

  useEffect(() => {
    if (gateOptions.length === 0) return;

    if (
      (!activeLearningOption || activeLearningOption === undefined) &&
      gateOptions.length > 0
    ) {
      const firstVal = gateOptions[0].value;
      setActiveLearningOption(firstVal);

      if (dateRange?.startDate && dateRange?.endDate) {
        fetchFromBackend(dateRange, firstVal);
      }
    }
  }, [gateOptions]);

  // When user picks date range (Date component updates dateRange), fetch if gate selected
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (
      activeLearningOption &&
      dateRange?.startDate &&
      dateRange?.endDate &&
      accessToken
    ) {
      fetchFromBackend(dateRange, activeLearningOption);
    }
  }, [activeLearningOption, dateRange]);

  // handler called when SelectControls changes
  const handleSelectChange = (val) => {
    setActiveLearningOption(val);
   
    fetchFromBackend(dateRange, val);
  };

  return (
    <Layout hasSider>
      <Layout>
        <Header className="header">
          <div className="header-left">
            <img src="/user.png" alt="Avatar" className="header-logo" />
            <span className="header-title">{username.toUpperCase()}</span>
          </div>
          <button className="logout-icon-btn" onClick={handleLogout}>
            <LogoutOutlined style={{ fontSize: "18px", color: "white" }} />
          </button>
        </Header>

        <Content style={{ marginTop: 64, overflow: "initial" }}>
          <div
            style={{
              // paddingTop: 4,

              background: " #f5f6fa",
              borderRadius: borderRadiusLG,
            }}
          >
            <ErrorBoundary>
                <Date
              fetchFromBackend={fetchFromBackend}
              setDateRange={setDateRange}
            />
            </ErrorBoundary>
          
          </div>

          {/* pass value and handler so select sends option -> backend with dateRange */}
          <div
            style={{
              textAlign: "center",
              paddingTop: 0,
              background: " #f5f6fa",
              borderRadius: borderRadiusLG,
            }}
          >
            <SelectControls
              value={activeLearningOption}
              onChange={handleSelectChange}
              options={gateOptions} /* populated from backend */
              placeholder="Choose scope"
            />
          </div>

          <div
            style={{
              paddingTop: 1,
              // textAlign: "center",
              background: " #f5f6fa",
              borderRadius: borderRadiusLG,
            }}
          >
            <Data
              data={data}
              loading={loading} 
              onRefresh={() =>
                fetchFromBackend(dateRange, activeLearningOption)
              }
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default HomePage;
