import axios from "axios";
export const getApiBaseUrl = () => {
  const orgName = localStorage.getItem("organizationName");
  if (!orgName) {
    console.warn("Organization name not set in localStorage");
    return "https://workerpool2.inuka.ai"; // fallback without org name
  }
  return `https://workerpool2.inuka.ai/${orgName}`;
};

export const getApiEndpoint = (path) => {
  return `${getApiBaseUrl()}${path}`;
};


// Robust logout logic
export const Logout = async (username, setUsername, setLoginStatus, setStatus) => {


  try {
    const response = await axios.post(getApiEndpoint("/api/logout_mobile"), {
      username: username,
    });

    if (response.status === 200) {

    } else {
      alert("Logout failed. Please try again.");
    }
  } catch (err) {
    alert("Logout failed. Please try again.");
  }

  // Cleanup ALWAYS runs (success or failure)
  localStorage.clear();



  setUsername(null);
  setLoginStatus(false);
  setStatus("Enable Push Notifications");
};
// Fetch user data based on date range and gate option
export const userDate = async (option, dates, setLoading, setData) => {
  const { startDate, endDate } = dates || dateRange;

  // guard: don't call backend when dates are missing -> avoids 400
  if (!startDate || !endDate) {
    console.warn(
      "fetchFromBackend: missing startDate or endDate, skipping request"
    );
    return;
  }
  setLoading(true);
  const username = localStorage.getItem("username");
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    console.log("Fetching data with:", {
      startDate,
      endDate,
      gate: option || activeLearningOption,
    });
    const response = await axios.post(
      // "https://backend.schmidvision.com/api/active_learning_mobile",
      getApiEndpoint("/api/active_learning_mobile"),
      { startDate, endDate, gate: option || activeLearningOption }, // send option
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }

    );

    if (response.status === 200) {
      setData(response.data.dailyRecords || []);
    }
    setLoading(false);
  } catch (error) {
    if (error.response.status === 401 && error.response.status === 403 && refreshToken) {
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
          return userDate(option, dates, setLoading, setData); // Retry with new token
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
  }
}

// Fetch gate options from backend and set state
export const gates = async (setGateOptions, setActiveLearningOption, activeLearningOption, setUsername, setLoginStatus, setStatus) => {

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

    console.log("Gate options response:", resp);
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

      // Set first gate if not already set
      if (!activeLearningOption && opts.length > 0) {
        setActiveLearningOption(opts[0].value);
      }
    } else {
      setGateOptions([]);
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
          return gates(setGateOptions, setActiveLearningOption, activeLearningOption, setUsername, setLoginStatus, setStatus); // Retry with new token
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