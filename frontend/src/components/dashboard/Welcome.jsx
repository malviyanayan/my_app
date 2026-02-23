import React from "react";

const Welcome = ({ role }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Welcome</h2>
      <p className="text-gray-600">
        You are logged in as <span className="font-semibold">{role}</span>.
      </p>
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <p>Select a menu item from the sidebar to continue.</p>
      </div>
    </div>
  );
};

export default Welcome;
