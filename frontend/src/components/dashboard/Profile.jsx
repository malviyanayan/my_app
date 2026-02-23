import React from "react";

const Profile = ({ role }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Profile</h2>

      <div className="space-y-3">
        <p><strong>Name:</strong> Demo User</p>
        <p><strong>Email:</strong> user@example.com</p>
        <p><strong>Role:</strong> {role}</p>
      </div>
    </div>
  );
};

export default Profile;
