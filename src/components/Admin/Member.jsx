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

} from "@ant-design/icons";
import "./Admin.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { getApiEndpoint } from "../../utils/apiConfig";
import { membersData,fetchDoor,departmentTeam } from "../../utils/adminapi"; 


const { Option } = Select;


const Mem = () => {
  const [hierarchyData, setHierarchyData] = useState({});
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [members, setMembers] = useState([]);
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [doorMappings, setDoorMappings] = useState([]);
  const [selectedDoor, setSelectedDoor] = useState(undefined);

  // Add these after your existing useState declarations
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editTime, setEditTime] = useState(0);
  const [searchText, setSearchText] = useState("");

  const [gateOptions, setGateOptions] = useState([]); // Add this after existing state declarations
  const [selectedGateFilter, setSelectedGateFilter] = useState(undefined);
  const [selectedGate, setSelectedGate] = useState(undefined); // <-- Add this line
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false); // For sidebar filter drawer
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [pageSize, setPageSize] = useState(10); // Track page size
  const [totalMembers, setTotalMembers] = useState(0); // Track total count

  // Add pending filter states
  const [pendingDept, setPendingDept] = useState(selectedDept);
  const [pendingTeam, setPendingTeam] = useState(selectedTeam);
  const [pendingGate, setPendingGate] = useState(selectedGate);
  const [pendingStartDate, setPendingStartDate] = useState(startDate);
  const [pendingEndDate, setPendingEndDate] = useState(endDate);

  useEffect(() => {
    fetchHierarchyData();
    fetchDoorMappings();

  
  }, []);

  // Add this effect to fetch gate options
  useEffect(() => {
    const fetchGateOptions = async () => {
     const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
        try {
          
  
        const resp = await axios.post(
  getApiEndpoint("/api/gates"),
  {}, // empty body
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
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
      
          if (opts.length > 0) {
            setSelectedGate(opts[0].value);
          }
        }
      } catch (err) {
          if (err.response.status === 401 && refreshToken)
         try {
          const refreshResponse = await axios.post(
             
            getApiEndpoint("/api/token/refresh"),
            { username, refreshToken }
          );

          if (
            refreshResponse.status === 200 &&
            refreshResponse.data.accessToken
          ) {
            localStorage.setItem(
              "accessToken",
              refreshResponse.data.accessToken
            );
            return fetchFromBackend(dates); // Retry with new token
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
          console.error("❌ Error fetching gate options:", err);
          setGateOptions([]);
        }
      };
  
      fetchGateOptions();
  }, []);

  const fetchHierarchyData = async () => {
    departmentTeam(setHierarchyData,setSelectedDept,setSelectedTeam,fetchMembers,startDate,endDate);
    
  };

  const fetchDoorMappings = async () => {
fetchDoor(setDoorMappings,setSelectedDoor);
  };

  // Add these before the return statement
  const handleEditClick = () => {
    setIsEditingTime(true);
    setEditTime(selectedDoor?.unlock_time || 0);
  };

  const handleSaveTime = async () => {
    if (!selectedDoor) return;
    const  username = localStorage.getItem("username");
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

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
            "Authorization": `Bearer ${accessToken}`,
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
   if(err.response.status === 401 && refreshToken){
        try {     
        const refreshResponse = await axios.post(     
            getApiEndpoint("/api/token/refresh"),
            { username, refreshToken }
          );
          if (
            refreshResponse.status === 200 &&
            refreshResponse.data.accessToken
          ) {
            localStorage.setItem(
              "accessToken",
              refreshResponse.data.accessToken
            );
            // Retry the save operation with the new token
            return handleSaveTime();
          } else {
            throw new Error(
              "Refresh token invalid or missing access token in response."
            );
          }
        } catch (refreshError) {
          alert("Session expired. Please login again.");
        
          setLoginStatus(false);
          setStatus("Enable Push Notifications");
          localStorage.removeItem("loginStatus");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("role");
          localStorage.removeItem("username");
        }
      }
      console.error("❌ Error saving time:", err);
    }
  };



;


  // Update fetchMembers to accept page and limit
  const fetchMembers = async (
    department,
    team,
    start,
    end,
    gate,
    page = currentPage,
    limit = pageSize
  ) => {
    membersData(department,team,start,end,gate,page,limit,setMembers,setTotalMembers);
    // console.log("Fetching members with111:", {
    //   department,
    //   team,
    //   startDate: start.format("YYYY-MM-DD"),
    //   endDate: end.format("YYYY-MM-DD"),
    //   gate,
    //   page,
    //   limit,
    // });
    // const deptToSend = !department || department === null ? undefined : department;
    // const teamToSend = !team || team === null ? undefined : team;
    // const gateToSend = !gate || gate === null ? undefined : gate;


    // console.log("Fetching members with:", {
    //   department: deptToSend,
    //   team: teamToSend,
    //   startDate: start.format("YYYY-MM-DD"),
    //   endDate: end.format("YYYY-MM-DD"),
    //   gate: gateToSend,
    //   page,
    //   limit,
    // });
    // try {
    //   const response = await axios.post(
    //     getApiEndpoint("/get_department_team_members"),
    //     {
    //       department: deptToSend,
    //       team: teamToSend,
    //       startDate: start.format("YYYY-MM-DD"),
    //       endDate: end.format("YYYY-MM-DD"),
    //       gate: gateToSend,
    //       page, // <-- send page
    //       limit, // <-- send limit
    //     },
    //     {
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   );
    //   console.log(response.data, "members response");
    //   if (response.status === 200) {
    //     setMembers(
    //       response.data.data.map((member, index) => ({
    //         key: index,
    //         name: member.name,
    //         enabled: member.admin_monitor,
    //         averageStay: member.averageDwellTime,
    //         systemId: member.system_id,
    //         assignedGate: member.assigned_gate || undefined,
    //       }))
    //     );
    //     setTotalMembers(response.data.totalRegisteredPersons || 0); // <-- set total count from backend
    //   }
    // } catch (err) {
    //   console.error("❌ Error fetching members:", err);
    // }


  };

  // When filters/search change, reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDept, selectedTeam, selectedGate, searchText, startDate, endDate]);

  // Fetch members when page or pageSize changes
  useEffect(() => {
    fetchMembers(selectedDept, selectedTeam, startDate, endDate, selectedGate, currentPage, pageSize);
    // eslint-disable-next-line
  }, [currentPage, pageSize]);

  // --- KEEP YOUR ROBUST LOGOUT LOGIC HERE ---

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


  return (
    <>
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
        {(selectedDept !== "all" || selectedTeam !== "all") && (
          <div className="active-filters-tags">
            <span className="filter-badge">{selectedDept}</span>
            {selectedTeam && selectedTeam !== "all" && (
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
                onChange={setPendingDept}
                value={pendingDept}
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
                onChange={setPendingTeam}
                value={pendingTeam}
                disabled={!pendingDept}
              >
                {pendingDept &&
                  Array.isArray(hierarchyData[pendingDept]) &&
                  hierarchyData[pendingDept].map((team) => (
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
                value={pendingStartDate}
                onChange={setPendingStartDate}
                format="YYYY-MM-DD"
              />
            </div>
            <div className="drawer-filter-item">
              <label className="drawer-filter-label">
                End Date
              </label>
              <DatePicker
                style={{ width: "100%" }}
                value={pendingEndDate}
                onChange={setPendingEndDate}
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
                value={pendingGate}
                onChange={setPendingGate}
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
              onClick={() => {
                setSelectedDept(pendingDept);
                setSelectedTeam(pendingTeam);
                setSelectedGate(pendingGate);
                setStartDate(pendingStartDate);
                setEndDate(pendingEndDate);
                setFilterDrawerOpen(false);
                // Fetch members with new filters
                fetchMembers(
                  pendingDept,
                  pendingTeam,
                  pendingStartDate,
                  pendingEndDate,
                  pendingGate,
                  1, // reset to page 1
                  pageSize
                );
                setCurrentPage(1);
              }}
            >
              Apply Filters
            </Button>
            <Button
              block
              size="large"
              onClick={() => {
                setSelectedDept("all");
                setSelectedTeam("all");
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
            current: currentPage,
            pageSize: pageSize,
            total: totalMembers,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          bordered={true}
          size="small"
          scroll={{ x: true }}
        />
      </div>
    </>
  )
}

export default Mem