// src/services/authService.js (example file)
import { jwtDecode } from "jwt-decode";

export const getUserId = () => {
  const token = sessionStorage.getItem("token"); // Or wherever you store your token
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.id; // Make sure your token payload has the 'id' field
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }
  return null;
};

export const logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("id");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("name");
  sessionStorage.removeItem("userEmail");
  // Redirect to login
  window.location.href = "/";
};
