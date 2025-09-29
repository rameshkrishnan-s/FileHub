// src/services/authService.js
import { jwtDecode } from "jwt-decode";

export const getUserId = () => {
  const token = sessionStorage.getItem("token");
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      // Check if token is expired
      if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
        logout();
        return null;
      }
      return decodedToken.id;
    } catch (error) {
      console.error("Error decoding token:", error);
      logout();
      return null;
    }
  }
  return null;
};

export const getUserRole = () => {
  const token = sessionStorage.getItem("token");
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      // Check if token is expired
      if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
        logout();
        return null;
      }
      return decodedToken.role;
    } catch (error) {
      console.error("Error decoding token:", error);
      logout();
      return null;
    }
  }
  return null;
};

export const getUserEmail = () => {
  const token = sessionStorage.getItem("token");
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      // Check if token is expired
      if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
        logout();
        return null;
      }
      return decodedToken.email;
    } catch (error) {
      console.error("Error decoding token:", error);
      logout();
      return null;
    }
  }
  return null;
};

export const getUserName = () => {
  const token = sessionStorage.getItem("token");
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      // Check if token is expired
      if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
        logout();
        return null;
      }
      return decodedToken.name;
    } catch (error) {
      console.error("Error decoding token:", error);
      logout();
      return null;
    }
  }
  return null;
};

export const isTokenValid = () => {
  const token = sessionStorage.getItem("token");
  if (!token) return false;
  
  try {
    const decodedToken = jwtDecode(token);
    // Check if token is expired
    if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
      logout();
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error validating token:", error);
    logout();
    return false;
  }
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
