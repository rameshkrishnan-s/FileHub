import React from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import logo from "../assets/logo.png"; // Adjust path as needed
import certs from "../assets/iso-certify-trans.png"; // Adjust path as needed

export default function Header() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-blue-100 to-blue-200 border-b-2 border-blue-600 shadow-md">
      <div className="flex justify-between items-center px-5 py-3">
        <img src={logo} alt="Company Logo" className="h-20 object-contain" />
        <div className="flex items-center space-x-4">
          <img src={certs} alt="Certifications" className="h-16 object-contain" />
      
        </div>
      </div>
    </div>
  );
}
