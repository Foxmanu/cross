import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { subscribeToPush } from "./utils/subscribe.js";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./components/navigation.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { useOnlineStatus } from "./Hooks/internet";


import "./App.css";


function App() {
  const [status, setStatus] = useState("Enable Push Notifications");
  const [Category, setCategory] = useState(localStorage.getItem("category") || null);
  const [username, setUsername] = useState(localStorage.getItem("username") || null);
  const [loginStatus, setLoginStatus] = useState(
    localStorage.getItem("loginStatus") === "true"
  );
  const [role, setRole] = useState(localStorage.getItem("role") || "");



  const handleSubscribe = async (tokenToUse) => {
    if (!tokenToUse) {
      console.log("No token available for subscription.");
      return;
    }
    setStatus("Subscribing...");
    try {
      await subscribeToPush(tokenToUse);
      setStatus("Subscribed!");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const isOnline = useOnlineStatus();

 

  return (
    <>
      <ErrorBoundary>
        <BrowserRouter>
          <AppRoutes
            username={username}
            setUsername={setUsername}
            status={status}
            setStatus={setStatus}
            loginStatus={loginStatus}
            setLoginStatus={setLoginStatus}
            role={role}
            setRole={setRole}
            handleSubscribe={handleSubscribe}
            category={Category}
            setCategory={setCategory}
          />
        </BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={true}
          limit={1} // Only one toast visible at a time
        />
      </ErrorBoundary>

    </>
  );
}

export default App;