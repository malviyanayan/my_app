import React from "react";

const CreateUser = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Create User</h2>

      <form className="space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Full Name"
          className="w-full border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
        />
        <select className="w-full border p-2 rounded">
          <option>User</option>
          <option>Admin</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateUser;
