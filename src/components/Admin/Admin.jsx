import React, { useEffect, useState } from "react";
import {
  Layout,
  Select,
  Table,
  Switch,
  Card,
  DatePicker,
  Button,
  Input,
  Tabs,
  Drawer,
  Space,
  Popover,
  Alert,
} from "antd";
import {
  LogoutOutlined,
  SearchOutlined,
  FilterOutlined,
  CloseOutlined,
  BellOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import "./Admin.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import UserProfile from "./userProfile";
import Authorization from "./Authorization";
import Flag from "./Flag";
import { getApiEndpoint } from "../../utils/apiConfig";
const { Header, Content } = Layout;
const { Option } = Select;


const Admin = (props) => {
  const {
    token,
    status,
    handleSubscribe,
    setToken,
    setLoginStatus,
    setStatus,
  } = props;
  const [hierarchyData, setHierarchyData] = useState({});
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [members, setMembers] = useState([]);
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [doorMappings, setDoorMappings] = useState([]);
  const [selectedDoor, setSelectedDoor] = useState(null);

  // Add these after your existing useState declarations
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editTime, setEditTime] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("1"); // <-- Add this line
  const [gateOptions, setGateOptions] = useState([]); // Add this after existing state declarations
  const [selectedGateFilter, setSelectedGateFilter] = useState(null);
  const [selectedGate, setSelectedGate] = useState(null); // <-- Add this line
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false); // For sidebar filter drawer

  const navigate = useNavigate();

  useEffect(() => {
    fetchHierarchyData();
    fetchDoorMappings();

    // eslint-disable-next-line
  }, []);

  // Add this effect to fetch gate options
  useEffect(() => {
    const fetchGateOptions = async () => {
      try {
        const resp = await axios.post(
          getApiEndpoint("/gates"),
          {}
        );
        if (resp.status === 200 && resp.data && resp.data.success) {
          let gatesRaw = resp.data.gates;
          if (
            gatesRaw &&
            !Array.isArray(gatesRaw) &&
            typeof gatesRaw === "object"
          ) {
            gatesRaw = Object.values(gatesRaw);
          }
          const gates = Array.isArray(gatesRaw) ? gatesRaw : [];
          const opts = gates.map((g) =>
            typeof g === "string"
              ? { label: g, value: g }
              : {
                  label: g.name || g.label || String(g.id ?? g.value),
                  value: g.id ?? g.value ?? g.name,
                }
          );
          setGateOptions(opts);
          // Set first gate as default
          if (opts.length > 0) {
            setSelectedGate(opts[0].value);
          }
        }
      } catch (err) {
        console.error("❌ Error fetching gate options:", err);
        setGateOptions([]);
      }
    };
    fetchGateOptions();
  }, []);

  const fetchHierarchyData = async () => {
    try {
      // POST with empty body and proper config (backend returns [hierarchyData])
      const response = await axios.post(
        getApiEndpoint("/get_departments"),
        {}, // empty body
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data, "response");
      if (response.status === 200) {
        // backend returns an array with hierarchy object: [hierarchyData]
        const respData =
          Array.isArray(response.data) &&
          response.data.length &&
          typeof response.data[0] === "object"
            ? response.data[0]
            : response.data && typeof response.data === "object"
            ? response.data
            : {};

        // collect all unique teams across departments
        const allTeamsSet = new Set();
        Object.keys(respData).forEach((d) => {
          const teams = Array.isArray(respData[d]) ? respData[d] : [];
          teams.forEach((t) => allTeamsSet.add(t));
        });
        const allTeams = Array.from(allTeamsSet);

        // Build new hierarchy including "All" entry
        const newResp = { All: allTeams, ...respData };

        // Ensure each department/team list includes "All" as first option
        Object.keys(newResp).forEach((k) => {
          if (!Array.isArray(newResp[k])) newResp[k] = [];
          if (!newResp[k].includes("All")) newResp[k].unshift("All");
        });

        setHierarchyData(newResp);

        // set defaults
        const departments = Object.keys(newResp);
        if (departments.length > 0) {
          const firstDept = departments[0];
          setSelectedDept(firstDept);

          const teams = Array.isArray(newResp[firstDept])
            ? newResp[firstDept]
            : [];
          if (teams.length > 0) {
            setSelectedTeam(teams[0]);
            // fetch members: if "All" selected, send nulls so backend can handle appropriately
            if (teams[0] === "All") {
              fetchMembers(null, null, startDate, endDate);
            } else {
              fetchMembers(firstDept, teams[0], startDate, endDate);
            }
          }
        }
      }
    } catch (err) {
      console.error("❌ Error fetching hierarchy data:", err);
    }
  };

  const fetchDoorMappings = async () => {
    try {
      const response = await axios.post(
        getApiEndpoint("/fastapi/door-access/admin/get-door-mappings"),
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data, "door mappings response");
      if (response.data.success) {
        setDoorMappings(response.data.door_mappings);
        // Set first door as default selected
        if (response.data.door_mappings.length > 0) {
          setSelectedDoor(response.data.door_mappings[0]);
        }
      }
    } catch (err) {
      console.error("❌ Error fetching door mappings:", err);
    }
  };

  // Add these before the return statement
  const handleEditClick = () => {
    setIsEditingTime(true);
    setEditTime(selectedDoor?.unlock_time || 0);
  };

  const handleSaveTime = async () => {
    if (!selectedDoor) return;

    try {
      await axios.post(
        getApiEndpoint("/fastapi/door-access/admin/unlock-door"),
        {
          index: selectedDoor.index,
          door_name: selectedDoor.door_name,
          unlock_time: "10",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state
      setDoorMappings((prev) =>
        prev.map((door) =>
          door.index === selectedDoor.index
            ? { ...door, unlock_time: editTime }
            : door
        )
      );
      setSelectedDoor((prev) => ({ ...prev, unlock_time: editTime }));
      setIsEditingTime(false);
    } catch (err) {
      console.error("❌ Error updating unlock time:", err);
    }
  };

  const handleDeptChange = (value) => {
    setSelectedDept(value);
    setSelectedTeam("All");
    setMembers([]);
    if (value === "All") {
      fetchMembers(null, null, startDate, endDate, selectedGate);
    } else {
      const teams = Array.isArray(hierarchyData[value])
        ? hierarchyData[value]
        : [];
      const teamToFetch = teams && teams.length ? teams[0] : null;
      setSelectedTeam(teamToFetch || "All");
      if (teamToFetch === "All" || teamToFetch === null) {
        fetchMembers(value, null, startDate, endDate, selectedGate);
      } else {
        fetchMembers(value, teamToFetch, startDate, endDate, selectedGate);
      }
    }
  };

  const handleTeamChange = (value) => {
    setSelectedTeam(value);
    if (startDate && endDate) {
      if (selectedDept === "All") {
        fetchMembers(
          null,
          value === "All" ? null : value,
          startDate,
          endDate,
          selectedGate
        );
      } else {
        fetchMembers(
          selectedDept,
          value === "All" ? null : value,
          startDate,
          endDate,
          selectedGate
        );
      }
    }
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (selectedDept && selectedTeam && date && endDate) {
      fetchMembers(selectedDept, selectedTeam, date, endDate);
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    if (selectedDept && selectedTeam && startDate && date) {
      fetchMembers(selectedDept, selectedTeam, startDate, date);
    }
  };

  const fetchMembers = async (department, team, start, end, gate) => {
    const deptToSend = department || undefined;
    const teamToSend = team || undefined;
    const gateToSend = gate || selectedGate; // Use selectedGate if not provided

    try {
      const response = await axios.post(
        getApiEndpoint("/get_department_team_members"),
        {
          department: deptToSend,
          team: teamToSend,
          startDate: start.format("YYYY-MM-DD : HH:mm:ss"),
          endDate: end.format("YYYY-MM-DD : HH:mm:ss"),
          gate: gate, // Send gate
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data, "members response");
      if (response.status === 200) {
        setMembers(
          response.data.data.map((member, index) => ({
            key: index,
            name: member.name,
            enabled: member.admin_monitor,
            averageStay: member.averageDwellTime,
            systemId: member.system_id,
            assignedGate: member.assigned_gate || undefined, // Add this line
          }))
        );
      }
    } catch (err) {
      console.error("❌ Error fetching members:", err);
    }
  };

  // --- KEEP YOUR ROBUST LOGOUT LOGIC HERE ---
  const handleLogout = async () => {
    await axios.post(getApiEndpoint("/api/logout_mobile"), {
      username: token,
    });
    setToken(null);
    setLoginStatus(false);
    setStatus("Enable Push Notifications");
    localStorage.removeItem("loginStatus");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/");
  };

  const handleToggleNotification = async (systemId, enabled) => {
    try {
      await axios.post(
        getApiEndpoint("/update_notification_status"),
        { system_id: systemId, enabled },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      console.error(`❌ Error updating notification for ${systemId}:`, err);
    }
  };

  const handleDoorSelect = (doorName) => {
    const door = doorMappings.find((d) => d.door_name === doorName);
    setSelectedDoor(door || null);
  };

  // Filter members based on search text and selected gate
  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesGate =
      !selectedGateFilter || member.assignedGate === selectedGateFilter;
    return matchesSearch && matchesGate;
  });

  // Update the columns definition
  const columns = [
    {
      title: "Member",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Enable",
      key: "enable",
      render: (_, record) => (
        <Switch
          defaultChecked={record.enabled}
          onChange={(checked) =>
            handleToggleNotification(record.systemId, checked)
          }
        />
      ),
    },

    { title: "Stay", dataIndex: "averageStay", key: "averageStay" },
  ];

  // Add handler for gate change
  const handleGateChange = async (systemId, gate) => {
    try {
      await axios.post(
        getApiEndpoint("/api/update_user_gate"),
        { system_id: systemId, gate },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state
      setMembers((prev) =>
        prev.map((member) =>
          member.systemId === systemId
            ? { ...member, assignedGate: gate }
            : member
        )
      );
    } catch (err) {
      console.error(`❌ Error updating gate for ${systemId}:`, err);
    }
  };

  return (
    <Layout className="app-layout">
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
            onClick={handleLogout}
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
              children: (
                <>
                  {/* Door Control Section */}
                  <Card className="door-control-card">
                    <div className="selectors" style={{ marginBottom: 0 }}>
                      <Select
                        placeholder="Select Gate"
                        style={{ flex: 1, minWidth: 200 }}
                        value={selectedDoor?.door_name}
                        onChange={handleDoorSelect}
                      >
                        {doorMappings.map((door) => (
                          <Option key={door.door_name} value={door.door_name}>
                            {door.door_name}
                          </Option>
                        ))}
                      </Select>

                      <Button
                        type="primary"
                        style={{ flex: 1, minWidth: 200 }}
                        onClick={handleSaveTime}
                        className="unlock-btn"
                      >
                        Unlock
                      </Button>
                    </div>{" "}
                  </Card>

                  {/* Search and Filter Card */}
                  <Card className="search-filter-card">
                    <div className="search-filter-content">
                      <div className="search-section">
                        <Input
                          placeholder="Search by member name..."
                          prefix={<SearchOutlined />}
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          size="large"
                          allowClear
                          className="search-input-combined"
                        />
                      </div>
                      <Button
                        type="primary"
                        icon={<FilterOutlined />}
                        onClick={() => setFilterDrawerOpen(true)}
                        className="filter-btn-combined"
                        size="large"
                      >
                        Filters
                      </Button>
                    </div>
                    {(selectedDept !== "All" || selectedTeam !== "All") && (
                      <div className="active-filters-tags">
                        <span className="filter-badge">{selectedDept}</span>
                        {selectedTeam && selectedTeam !== "All" && (
                          <span className="filter-badge">{selectedTeam}</span>
                        )}
                      </div>
                    )}
                  </Card>

                  {/* Filter Sidebar Drawer */}
                  <Drawer
                    title={
                      <div className="drawer-title">
                        <FilterOutlined style={{ marginRight: 8 }} />
                        <span>Filters</span>
                      </div>
                    }
                    placement="left"
                    onClose={() => setFilterDrawerOpen(false)}
                    open={filterDrawerOpen}
                    width={
                      window.innerWidth < 480
                        ? "90%"
                        : window.innerWidth < 768
                        ? "85%"
                        : 400
                    }
                    className="filter-drawer"
                    closeIcon={<CloseOutlined />}
                  >
                    <div className="drawer-filters-content">
                      {/* Department & Team */}
                      <div className="drawer-filter-section">
                        <h4 className="drawer-section-title">Organization</h4>
                        <div className="drawer-filter-item">
                          <label className="drawer-filter-label">
                            Department
                          </label>
                          <Select
                            placeholder="Select Department"
                            style={{ width: "100%" }}
                            onChange={handleDeptChange}
                            value={selectedDept}
                          >
                            {Object.keys(hierarchyData)?.map((dept) => (
                              <Option key={dept} value={dept}>
                                {dept}
                              </Option>
                            ))}
                          </Select>
                        </div>
                        <div className="drawer-filter-item">
                          <label className="drawer-filter-label">Team</label>
                          <Select
                            placeholder="Select Team"
                            style={{ width: "100%" }}
                            onChange={handleTeamChange}
                            value={selectedTeam}
                            disabled={!selectedDept}
                          >
                            {selectedDept &&
                              Array.isArray(hierarchyData[selectedDept]) &&
                              hierarchyData[selectedDept].map((team) => (
                                <Option key={team} value={team}>
                                  {team}
                                </Option>
                              ))}
                          </Select>
                        </div>
                      </div>

                      {/* Date Range */}
                      <div className="drawer-filter-section">
                        <h4 className="drawer-section-title">Date Range</h4>
                        <div className="drawer-filter-item">
                          <label className="drawer-filter-label">
                            Start Date
                          </label>
                          <DatePicker
                            style={{ width: "100%" }}
                            value={startDate}
                            onChange={handleStartDateChange}
                            format="YYYY-MM-DD"
                          />
                        </div>
                        <div className="drawer-filter-item">
                          <label className="drawer-filter-label">
                            End Date
                          </label>
                          <DatePicker
                            style={{ width: "100%" }}
                            value={endDate}
                            onChange={handleEndDateChange}
                            format="YYYY-MM-DD"
                          />
                        </div>
                      </div>

                      {/* Gate Filter */}
                      <div className="drawer-filter-section">
                        <h4 className="drawer-section-title">Gate</h4>
                        <div className="drawer-filter-item">
                          <label className="drawer-filter-label">
                            Gate Filter
                          </label>
                          <Select
                            placeholder="Filter by gate"
                            style={{ width: "100%" }}
                            value={selectedGate}
                            onChange={(value) => {
                              setSelectedGate(value);
                              fetchMembers(
                                selectedDept,
                                selectedTeam,
                                startDate,
                                endDate,
                                value
                              );
                            }}
                          >
                            {gateOptions.map((gate) => (
                              <Option key={gate.value} value={gate.value}>
                                {gate.label}
                              </Option>
                            ))}
                          </Select>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="drawer-actions">
                        <Button
                          type="primary"
                          block
                          size="large"
                          onClick={() => setFilterDrawerOpen(false)}
                        >
                          Apply Filters
                        </Button>
                        <Button
                          block
                          size="large"
                          onClick={() => {
                            setSelectedDept("All");
                            setSelectedTeam("All");
                            setSelectedGate(null);
                            setSearchText("");
                            setStartDate(dayjs());
                            setEndDate(dayjs());
                          }}
                          style={{ marginTop: 12 }}
                        >
                          Reset All
                        </Button>
                      </div>
                    </div>
                  </Drawer>

                  <div className="table-wrapper">
                    <Table
                      dataSource={filteredMembers}
                      columns={columns}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50"],
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} items`,
                      }}
                      bordered={true}
                      size="small"
                      scroll={{ x: true }}
                    />
                  </div>
                </>
              ),
            },
            {
              key: "2",
              label: window.innerWidth < 480 ? "Admin" : "Admin Management",
              children: <UserProfile token={token} />,
            },
            {
              key:"3",
              label: window.innerWidth < 480 ? "Auth" : "Door Management",
              children:<Authorization/>,
            },
            {
              key: "4", 
              label: window.innerWidth < 480 ? "flaged" : "Authorization Logs",
              children: <Flag />,
            }
          ]}
        />
      
      </Content>
    </Layout>
  );
};

export default Admin;
