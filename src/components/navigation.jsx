import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./LoginPage.jsx";
import HomePage from "./Home/HomePage.jsx";
import Admin from "./Admin/Admin.jsx";
function AppRoutes({
 username,
  setUsername,
  status,
  setStatus,
  loginStatus,
  setLoginStatus,
  role,
  setRole,
  handleSubscribe,
}) {
  return (
    <Routes>
      <Route
        path="/"
        element={
          !username ? (
            <LoginPage
              setUsername={setUsername}
              setLoginStatus={setLoginStatus}
              handleSubscribe={handleSubscribe}
              setRole={setRole}
            />
          ) : role === "admin" ? (
            <Navigate to="/admin" replace />
          ) : (
            <Navigate to="/home" replace />
          )
        }
      />
      <Route
        path="/admin"
        element={
          username && role === "admin" ? (
            <Admin
              username={username}
              status={status}
              handleSubscribe={handleSubscribe}
              setUsername={setUsername}
              setLoginStatus={setLoginStatus}
              setStatus={setStatus}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/home"
        element={
          username && role !== "admin" ? (
            <HomePage
              username={username}
              status={status}
              handleSubscribe={handleSubscribe}
              setUsername={setUsername}
              setLoginStatus={setLoginStatus}
              setStatus={setStatus}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}


export default AppRoutes;
