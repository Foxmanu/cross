import axios from "axios";
import { getApiEndpoint } from "./apiConfig";
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const username = localStorage.getItem("username");
  const extractUnauthorized = (respData) => {
    const out = [];
    if (!Array.isArray(respData)) return out;
    respData.forEach((day) => {
      const people = day.people || {};
      Object.values(people).forEach((p) => {
        if (p && p.unauth_number) {
          out.push({
            unauth_number: p.unauth_number,
            first_seen: p.first_seen || p.recent_first_seen || "—",
            last_seen: p.last_seen || "—",
            total_time: p.total_time || "—",
          });
        }
      });
    });
    return out;
  };

export const membersData = async (department, team, start, end, gate, page, limit, setMembers, setTotalMembers) => {
  console.log("membersData called with:", { department, team, start, end, gate, page, limit });

  const deptToSend = !department || department === null ? undefined : department;
  const teamToSend = !team || team === null ? undefined : team;
  const gateToSend = !gate || gate === null ? undefined : gate;

  console.log("Fetching members with:", {
    department: deptToSend,
    team: teamToSend,
    startDate: start.format("YYYY-MM-DD"),
    endDate: end.format("YYYY-MM-DD"),
    gate: gateToSend,
    page,
    limit,
  });
  try {
    const response = await axios.post(
      getApiEndpoint("/get_department_team_members"),
      {
        department: deptToSend,
        team: teamToSend,
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        gate: gateToSend,
        page, // <-- send page
        limit, // <-- send limit
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
          assignedGate: member.assigned_gate || undefined,
        }))
      );
      setTotalMembers(response.data.totalRegisteredPersons || 0); // <-- set total count from backend
    }
  } catch (err) {
    if (err.response ||err.response.status === 401 || err.response.status === 403 || refreshToken) {
      try {
        const refreshResponse = await axios.post(
          getApiEndpoint("/api/token/refresh"),
          {  refreshToken }
        );

        if (refreshResponse.status === 200 && refreshResponse.data.success) {
          localStorage.setItem("accessToken", refreshResponse.data.accessToken);
          // Retry fetching members after refreshing token
          return membersData(department, team, start, end, gate, page, limit, setMembers, setTotalMembers);
        } else {
          // Redirect to login or handle unauthorized state
          console.error("❌ Unable to refresh token, please log in again.");
        }
      } catch (refreshErr) {
        console.error("❌ Error refreshing token:", refreshErr);
      }
    } else {
      console.error("❌ Error fetching members:", err);
    }
    console.error("❌ Error fetching members:", err);
  }
}



export const fetchDoor = async (setDoorMappings, setSelectedDoor) => {

  try {
    const response = await axios.post(
      getApiEndpoint("/fastapi/door-access/admin/get-door-mappings"),
      {},
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        }
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
    if (err.response && err.response.status === 401 && refreshToken) {
      try {
        const refreshResponse = await axios.post(
          getApiEndpoint("/api/token/refresh"),
          { refreshToken }
        );

        if (refreshResponse.status === 200 && refreshResponse.data.success) {
          localStorage.setItem("accessToken", refreshResponse.data.accessToken);
          // Retry fetching door mappings after refreshing token
          return fetchDoor(setDoorMappings, setSelectedDoor);
        } else {
          // Redirect to login or handle unauthorized state
          console.error("❌ Unable to refresh token, please log in again.");
        }
      } catch (refreshErr) {
        console.error("❌ Error refreshing token:", refreshErr);
      }
    } else {
      console.error("❌ Error fetching door mappings:", err);
    }
    console.error("❌ Error fetching door mappings:", err);
  }
}



export const departmentTeam = async (setHierarchyData, setSelectedDept, setSelectedTeam) => {
  try {
    // POST with empty body and proper config (backend returns [hierarchyData])
 
    const response = await axios.post(
      getApiEndpoint("/get_departments"),
      {}, // empty body
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        }
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
      const newResp = { all: allTeams, ...respData };

      // Ensure each department/team list includes "All" as first option
      Object.keys(newResp).forEach((k) => {
        if (!Array.isArray(newResp[k])) newResp[k] = [];
        if (!newResp[k].includes("all")) newResp[k].unshift("all");
      });

      setHierarchyData(newResp);

      // set defaults and return them for the caller to use
      const departments = Object.keys(newResp);
      if (departments.length > 0) {
        const firstDept = departments[0];
        setSelectedDept(firstDept);

        const teams = Array.isArray(newResp[firstDept])
          ? newResp[firstDept]
          : [];
        if (teams.length > 0) {
          setSelectedTeam(teams[0]);
          // Return values so caller can fetch members
          return { firstDept, firstTeam: teams[0] };
        }
        return { firstDept, firstTeam: null };
      }
      return { firstDept: null, firstTeam: null };
    }
    return { firstDept: null, firstTeam: null };
  } catch (err) {
    if (err.response ||err.response.status === 401 || err.response.status === 403 || refreshToken) {
      try {
        const refreshResponse = await axios.post(
          getApiEndpoint("/api/token/refresh"),
          {  refreshToken }
        );

        if (refreshResponse.status === 200 && refreshResponse.data.success) {
          localStorage.setItem("accessToken", refreshResponse.data.accessToken);
          // Retry fetching departments after refreshing token
          return departmentTeam(setHierarchyData, setSelectedDept, setSelectedTeam, fetchMembers, startDate, endDate);
        } else {
          // Redirect to login or handle unauthorized state
          console.error("❌ Unable to refresh token, please log in again.");
        }
      } catch (refreshErr) {
        console.error("❌ Error refreshing token:", refreshErr);
      }
    } else {
      console.error("❌ Error fetching departments:", err);
    }
    console.error("❌ Error fetching departments:", err);
  }
}



//flag admin monitor for a person
export const flag = async (setItems, setError, setLoading) => {

  try {
    // POST as in your curl example
    const resp = await axios.post(getApiEndpoint("/flagged_persons"), {
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (resp.data && resp.data.success) {
      console.log("fetch flagged persons", resp.data);
      setItems(resp.data.flagged_persons || []);
    } else {
      setItems([]);
      setError("No data returned");
    }
  } catch (err) {
    if (err.response ||err.response.status === 401 || err.response.status === 403 || refreshToken) {
      try {
        const refreshResponse = await axios.post(
          getApiEndpoint("/api/token/refresh"),
          {  refreshToken }
        );

        if (refreshResponse.status === 200 && refreshResponse.data.success) {
          localStorage.setItem("accessToken", refreshResponse.data.accessToken);
          // Retry fetching flagged persons after refreshing token
          return flag(setItems, setError, setLoading);
        } else {
          // Redirect to login or handle unauthorized state
          console.error("❌ Unable to refresh token, please log in again.");
        }
      } catch (refreshErr) {
        console.error("❌ Error refreshing token:", refreshErr);
      }
    } else {
      console.error("❌ Error fetching flagged persons:", err);
    }
    console.error("❌ Error fetching flagged persons:", err);
    setError("Failed to load flagged persons");
    setItems([]);
  } finally {
    setLoading(false);
  }
}


export const unAiuthorize = async (setData, setLoading, startDate, endDate) => {
  const username = localStorage.getItem("username");
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    setLoading(true);
    const resp = await axios.get(getApiEndpoint("/api/people"), {
      params: { startDate: startDate, endDate: endDate },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    setData(extractUnauthorized(resp.data));
  } catch (err) {
    if (err.response|| err.response.status === 401 || err.response.status === 403 || refreshToken) {
      try {
        const refreshResponse = await axios.post(
          getApiEndpoint("/api/token/refresh"),
          { refreshToken }
        );

        if (refreshResponse.status === 200 && refreshResponse.data.success) {
          localStorage.setItem("accessToken", refreshResponse.data.accessToken);
          // Retry fetching people after refreshing token
          return unAiuthorize(setData, setLoading, startDate, endDate);
        } else {
          // Redirect to login or handle unauthorized state
          console.error("❌ Unable to refresh token, please log in again.");
        }
      } catch (refreshErr) {
        console.error("❌ Error refreshing token:", refreshErr);
      }
    } else {
      console.error("❌ Error fetching people:", err);
    }
    console.error("❌ Error fetching people:", err);
    setData([]);
  } finally {
    setLoading(false);
  }
}


export const toggleNotification = async (systemId, enable, setError, setLoading, fetchData) => {
  const username = localStorage.getItem("username");
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  try {
    setLoading(true);
    const resp = await axios.post(
      getApiEndpoint("/toggle_admin_monitor"),
      {
        system_id: systemId,
        enable: enable,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (resp.data && resp.data.success) {
      // Refresh data after successful toggle
      fetchData();
    } else {
      setError("Failed to update notification setting");
    }
  } catch (err) {
    if (err.response || err.response.status === 401 || err.response.status === 403 || refreshToken) {
      try {
        const refreshResponse = await axios.post(
          getApiEndpoint("/api/token/refresh"),
          { refreshToken }
        );

        if (refreshResponse.status === 200 && refreshResponse.data.success) {
          localStorage.setItem("accessToken", refreshResponse.data.accessToken);
          // Retry toggling notification after refreshing token
          return toggleNotification(systemId, enable, setError, setLoading, fetchData);
        } else {
          // Redirect to login or handle unauthorized state
          console.error("❌ Unable to refresh token, please log in again.");
        }
      } catch (refreshErr) {
        console.error("❌ Error refreshing token:", refreshErr);
      }
    } else {
      console.error("❌ Error toggling notification:", err);
    }
    console.error("❌ Error toggling notification:", err);
    setError("Failed to update notification setting");
  } finally {
    setLoading(false);
  }
} 