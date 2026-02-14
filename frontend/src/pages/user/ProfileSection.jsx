import React from "react";
export default function ProfileSection({ user, navigate }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Position:</strong> {user.position}</p>
      <button
        onClick={() => {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          navigate("/");
        }}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
