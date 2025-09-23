import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginPage.jsx";
import AdminDashboard from "./pages/Dashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import ViewerDashboard from "./pages/ViewerDashboard.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import Login from "./pages/LoginPage.jsx";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/viewer" element={<ViewerDashboard />} />
        <Route path="/admin-page" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
