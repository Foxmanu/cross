import React, { useEffect, useState, lazy, Suspense } from "react";
import {
  Layout,
  Select,

  Button,

  Spin,
  Modal,

  Tabs,

} from "antd";
import {
  LogoutOutlined,


} from "@ant-design/icons";
import "./Admin.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { getApiEndpoint, Logout } from "../../utils/apiConfig";

const UserProfile = lazy(() => import("./userProfile"));
const Authorization = lazy(() => import("./Authorization"));
const Flag = lazy(() => import("./Flag"));
const Member = lazy(() => import("./Member"));

const { Header, Content } = Layout;
const { Option } = Select;
const Admin = (props) => {
  const {
    username,
    status,
    handleSubscribe,
    setUsername,
    setLoginStatus,
    setStatus,
  } = props;
  const [activeTab, setActiveTab] = useState("1"); // <-- Add this line
  const navigate = useNavigate();
  const [modal, contextHolder] = Modal.useModal();

  // read mobile access flag from localStorage (fallback false)
  const [mobileAccessFeatures, setMobileAccessFeatures] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mobile_access_features")) ?? false;
    } catch {
      return false;
    }
  });

  // if the flag is updated elsewhere, keep in sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "mobile_access_features") {
        try {
          setMobileAccessFeatures(JSON.parse(e.newValue));
        } catch {
          setMobileAccessFeatures(false);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ensure activeTab remains valid if features are not available
  useEffect(() => {
    if (!mobileAccessFeatures && (activeTab === "3" || activeTab === "4")) {
      setActiveTab("1");
    }
  }, [mobileAccessFeatures, activeTab]);

  // --- KEEP YOUR ROBUST LOGOUT LOGIC HERE ---
  const handleLogout = async () => {
    console.log("Logging out user:");
    Logout(username, setUsername, setLoginStatus, setStatus)


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
  };

  const TabLoader = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px'
    }}>
      <Spin size="large" tip="Loading..." />
    </div>
  )

  return (
    <Layout className="app-layout">
      {contextHolder}
      <Header className="app-header">
        <div className="header-left">
          <img src="/user.png" alt="Avatar" />
          <span>Admin Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Notification Popover */}

          <Button
            className="logout-icon-btn"
            type="text"
            icon={
              <LogoutOutlined style={{ fontSize: "20px", color: "white" }} />
            }
            onClick={confirmLogout}
          />
        </div>
      </Header>

      <Content className="app-content">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[

            {
              key: "1",
              label: window.innerWidth < 480 ? "Members" : "Member Management",
              children: <Suspense fallback={<TabLoader />}><Member /></Suspense>,
            },
            {
              key: "2",
              label: window.innerWidth < 480 ? "Admin" : "Admin Management",
              children: <Suspense fallback={<TabLoader />}><UserProfile /></Suspense>,
            },
            // Conditionally include Door Management and Logs only if mobileAccessFeatures is true
            ...(mobileAccessFeatures
              ? [
                {
                  key: "3",
                  label: window.innerWidth < 480 ? "UnAuth" : "Door Management",
                  children: <Authorization />,
                },
                {
                  key: "4",
                  label: window.innerWidth < 480 ? "flaged" : "Authorization Logs",
                  children: <Flag />,
                },
              ]
              : []),

          ]}
        />
      </Content>
    </Layout>
  );
};

export default Admin;
