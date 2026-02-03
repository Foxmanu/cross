import React, { use } from 'react'
import { useState, useEffect } from "react";
import { Layout, theme, Modal } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { Logout } from "../../utils/apiConfig";
import Date from "../Date/Date";
import axios from "axios";
import { getApiEndpoint } from "../../utils/apiConfig";
import Analytics from "./anlyatic";
import dayjs from "dayjs";

import "./retail.css";

function retail({
  setUsername,
  setLoginStatus,
  username,
  setStatus,
  handleSubscribe,
  setRole,
}) {
  const { Header, Content } = Layout;

  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [loading, setLoading] = useState(false);
  const [gateOptions, setGateOptions] = useState([]);
  const [selectedGate, setSelectedGate] = useState("all");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [modal, contextHolder] = Modal.useModal();



  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const fetchFromBackend = async (dates, option) => {

    setLoading(true);
    const startDate = dayjs(dates?.startDate).format("YYYY-MM-DD");
    const endDate = dayjs(dates?.endDate).format("YYYY-MM-DD");
    const gate = option || selectedGate || "all";
    // prefer a viewType sent by Date component (e.g. "monthly","daily","weekly")
    const viewType = dates?.shortcut || dates?.viewType || "daily";


    console.log("Formatted Dates:", { startDate, endDate, viewType, gate });



    if (!startDate || !endDate) {
      console.warn("fetchFromBackend: missing dates, skipping request");
      setLoading(false);
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");


      const resp = await axios.post(
        getApiEndpoint("/api/analytics_mobile"),
        {
          startDate: startDate,
          endDate: endDate,
          gate: "all",
          viewType: viewType,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // if backend expects it
          },
        }
      );


      if (resp?.status === 200) {
        // store response for UI consumption
        setAnalyticsData(resp.data);
        console.log("analytics response", resp.data);
      } else {
        console.warn("analytics request returned", resp?.status);
        setAnalyticsData(null);
      }
    } catch (error) {
      if (error.response.status === 401|| error.response.status === 403 && refreshToken) {
        try {
          const refreshResponse = await axios.post(

            getApiEndpoint("/api/token/refresh"),
            {  refreshToken }
          );

          if (
            refreshResponse.status === 200 &&
            refreshResponse.data.accessToken
          ) {
            localStorage.setItem(
              "accessToken",
              refreshResponse.data.accessToken
            );
            return fetchFromBackend(dates, option); // Retry with new token
          } else {
            throw new Error(
              "Refresh token invalid or missing access token in response."
            );
          }
        } catch (refreshError) {
          alert("Session expired. Please login again.");
          setUsername(null);
          setLoginStatus(false);
          setStatus("Enable Push Notifications");
          localStorage.removeItem("loginStatus");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("role");
          localStorage.removeItem("username");
        }
        setLoading(false);
      } else {
        let message = "❌ An unexpected error occurred";
        if (error.response) {
          message = `🚫 Server Error: ${error.response.status}\n${error.response.data?.error || error.response.statusText
            }`;
        } else if (error.request) {
          message = "error: No response from the server.";
        } else {
          message = `⚠️ Error: ${error.message}`;
        }
        alert(message);
      }
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log("Logging out user:")
    Logout(username, setUsername, setLoginStatus, setStatus);
  };


  const confirmLogout = () => {
    modal.confirm({

      title: "Confirm Logout",
      content: "Are you sure you want to log out?",
      okText: "Yes",
      cancelText: "No",
      zIndex: 10000,
      onOk: handleLogout,
    });

  }

  // useEffect(() => {
  //   const fetchGateOptions = async () => {
  //     setLoading(true);
  //     try {
  //       const accessToken = localStorage.getItem("accessToken");

  //       const resp = await axios.post(
  //         getApiEndpoint("/api/gates"),
  //         {},
  //         {
  //           headers: {
  //             Authorization: `Bearer ${accessToken}`,
  //           },
  //         }
  //       );

  //       if (resp.status === 200 && resp.data?.success) {
  //         let gatesRaw = resp.data.gates;

  //         if (!Array.isArray(gatesRaw) && typeof gatesRaw === "object") {
  //           gatesRaw = Object.values(gatesRaw);
  //         }

  //         const opts = (gatesRaw || []).map((g) =>
  //           typeof g === "string"
  //             ? { label: g, value: g }
  //             : {
  //               label: g.name || g.label || String(g.id),
  //               value: g.id ?? g.value ?? g.name,
  //             }
  //         );

  //         setGateOptions(opts);

  //         if (opts.length > 0) {
  //           setSelectedGate(opts[0].value);
  //         }
  //       }
  //     } catch (err) {
  //       if (err.response.status === 401 && refreshToken)
  //        try {
  //         const refreshResponse = await axios.post(

  //           getApiEndpoint("/api/token/refresh"),
  //           { username, refreshToken }
  //         );

  //         if (
  //           refreshResponse.status === 200 &&
  //           refreshResponse.data.accessToken
  //         ) {
  //           localStorage.setItem(
  //             "accessToken",
  //             refreshResponse.data.accessToken
  //           );
  //           return fetchGateOptions(); // Retry with new token
  //         } else {
  //           throw new Error(
  //             "Refresh token invalid or missing access token in response."
  //           );
  //         }
  //       } catch (refreshError) {
  //         alert("Session expired. Please login again.");
  //         setUsername(null);
  //         setLoginStatus(false);
  //         setStatus("Enable Push Notifications");
  //         localStorage.removeItem("loginStatus");
  //         localStorage.removeItem("accessToken");
  //         localStorage.removeItem("refreshToken");
  //         localStorage.removeItem("role");
  //         localStorage.removeItem("username");
  //       }
  //         console.error("❌ Error fetching gate options:", err);
  //         setGateOptions([]);
  //       }
  //   };

  //   fetchGateOptions();
  // }, []);
  useEffect(() => {
    if (dateRange?.startDate && dateRange?.endDate) {
      fetchFromBackend(dateRange, selectedGate);
    }
  }, [selectedGate, dateRange]);

  return (
    <Layout>
      {contextHolder}
      <Header className="header">
        <div className="header-left">
          <img src="/user.png" alt="Avatar" className="header-logo" />
          <span className="header-title">{username.toUpperCase()}</span>
        </div>

        <button className="logout-icon-btn" onClick={confirmLogout}>
          <LogoutOutlined style={{ fontSize: "18px", color: "white" }} />
        </button>
      </Header>

      <Content style={{ marginTop: 64 }}>
        <div
          style={{
            background: "#f5f6fa",
            borderRadius: borderRadiusLG,
            padding: 12,
          }}
        >
          <Date
            fetchFromBackend={fetchFromBackend}
            setDateRange={setDateRange}
            loading={loading}
          />
          {/* <div style={{
            textAlign: "center",
            paddingTop: 0,
            background: " #f5f6fa",
            borderRadius: borderRadiusLG,

            padding: 12
          }}>
            <select
              className="retail-select"
              value={selectedGate}
              onChange={(e) => {
                setSelectedGate(e.target.value);
                // trigger fetch with new gate for current dates
                fetchFromBackend(dateRange, e.target.value);
              }}
              disabled={loading || gateOptions.length === 0}
            >
              <option value="all">All </option>
              {gateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div> */}
          <div style={{
            textAlign: "center",
            paddingTop: 0,
            background: " #f5f6fa",
            borderRadius: borderRadiusLG,

            padding: 12
          }}>
            <Analytics
              analyticsData={analyticsData}
              loading={loading}
              selectedGate={selectedGate}
            />

          </div>
          {/* Analytics Component */}


        </div>
      </Content>
    </Layout>
  );
}
export default retail;