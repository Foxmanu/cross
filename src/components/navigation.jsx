import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Spin } from "antd";
const LoginPage = lazy(() => import("./LoginPage.jsx"));
const HomePage = lazy(() => import("./Home/HomePage.jsx"));
const Admin = lazy(() => import("./Admin/Admin.jsx"));
const Retail = lazy(() => import("./Retial/retail.jsx")); // added retail route

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
  const PageLoader = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Spin size="large" tip="Loading..." />
    </div>
  );

  // read category set on login
  const category = typeof window !== "undefined" ? localStorage.getItem("category") : null;

  return (
    <Suspense fallback={<PageLoader />}>
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
            ) : category === "retail" ? (
              <Navigate to="/retail" replace />
            ) : role === "admin" ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />
        <Route
          path="/retail"
          element={
            username && category === "retail" ? (
              <Retail 
                username={username}
                status={status}
                setUsername={setUsername}
                setLoginStatus={setLoginStatus}
                handleSubscribe={handleSubscribe}
                setRole={setRole}/>
            ) : (
              <Navigate to="/" replace />
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
            username && role !== "admin" && category !== "retail" ? (
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
    </Suspense>
  );
}

export default AppRoutes;
