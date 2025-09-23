import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/Dashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import ViewerDashboard from "./pages/ViewerDashboard.jsx";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/viewer" element={<ViewerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
