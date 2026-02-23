import { useEffect, useState } from "react";
import { FaSearch, FaEdit, FaTrash, FaEye, FaTimes, FaSave } from "react-icons/fa";
import API from "../../api";
import toast from "react-hot-toast";
import "./AllUsers.css";

const AllUsers = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
    status: "unverified",
  });

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const fetchUsers = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/getusers?page=${pageNumber}`);

      if (res.data.success) {
        setUsers(res.data.data);
        setTotalPages(res.data.totalPages);
        setPage(res.data.page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const filteredUsers = users.filter(
    user =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditClick = (user) => {
    setEditUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      newPassword: "",
      confirmPassword: "",
      status: user.status || "unverified",
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateEditForm = () => {
    if (!editForm.name.trim()) {
      toast.error("Name is required");
      return false;
    }

    if (!editForm.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      toast.error("Invalid email format");
      return false;
    }

    if (editForm.newPassword && editForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (editForm.newPassword !== editForm.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) return;

    try {
      setEditLoading(true);

      const updateData = {
        name: editForm.name,
        email: editForm.email,
        status: editForm.status,
      };

      if (editForm.newPassword) {
        updateData.password = editForm.newPassword;
      }

      console.log("abey sale")
      const res = await API.put(`/admin/updateuser/${editUser._id}`, updateData);

      console.log("update user clicked....")
      console.log(res.data)

      if (res.data.success) {
        console.log('bholu')
        toast.success(res.data.message || "User updated successfully");
        
        setUsers(prev =>
          prev.map(u => (u._id === editUser._id ? { ...u, ...updateData } : u))
        );

        setEditUser(null);
        setEditForm({
          name: "",
          email: "",
          newPassword: "",
          confirmPassword: "",
          status: "unverified",
        });
      }
    } catch (err) {
      console.log("bhalu....")
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setEditLoading(false);
    }


    console.log("www")
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;

    try {
      setDeleteLoading(true);
      const res = await API.delete(`/admin/deleteuser/${deleteUser._id}`);
      
      if (res.data.success) {
        toast.success(res.data.message || "User deleted successfully");
        setUsers(prev => prev.filter(u => u._id !== deleteUser._id));
        setDeleteUser(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateCreateForm = () => {
    if (!createForm.name.trim()) {
      toast.error("Name is required");
      return false;
    }

    if (!createForm.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(createForm.email)) {
      toast.error("Invalid email format");
      return false;
    }

    if (!createForm.password || createForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (createForm.password !== createForm.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!validateCreateForm()) return;

    try {
      setCreateLoading(true);

      const res = await API.post("/admin/createuser", {
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
      });

      if (res.data.success) {
        toast.success(res.data.message || "User created successfully");
        fetchUsers(page);
        setShowCreateModal(false);
        setCreateForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "user",
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="all-users">
      {/* Header */}
      <div className="users-header">
        <div className="header-text">
          <h2 className="page-title">User Management</h2>
          <p className="page-subtitle">Manage and monitor all registered users</p>
        </div>

        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-create">
            + Create User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{users.filter(u => u.status === 'active').length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{users.filter(u => u.status === 'Blocked').length}</div>
          <div className="stat-label">Blocked</div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading-cell">
                  <div className="spinner"></div>
                  <p>Loading users...</p>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-cell">
                  <p>No users found</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr key={user._id}>
                  <td>{(page - 1) * 10 + index + 1}</td>
                  <td className="user-name-cell">{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status-badge ${
                      user.status === 'active' ? 'active' : 
                      user.status === 'Blocked' ? 'blocked' : 
                      'unverified'
                    }`}>
                      {user.status || 'unverified'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="action-btn view"
                        title="View"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEditClick(user)}
                        className="action-btn edit"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setDeleteUser(user)}
                        className="action-btn delete"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && filteredUsers.length > 0 && (
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(prev => prev - 1)}
              className="page-btn"
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(prev => prev + 1)}
              className="page-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="close-btn">
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedUser.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedUser.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${
                  selectedUser.status === 'active' ? 'active' : 
                  selectedUser.status === 'Blocked' ? 'blocked' : 
                  'unverified'
                }`}>
                  {selectedUser.status || 'unverified'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Created At:</span>
                <span className="detail-value">
                  {selectedUser.createdAt 
                    ? new Date(selectedUser.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })
                    : 'N/A'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Updated At:</span>
                <span className="detail-value">
                  {selectedUser.updatedAt 
                    ? new Date(selectedUser.updatedAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedUser(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="modal-overlay" onClick={() => !editLoading && setEditUser(null)}>
          <div className="modal large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button
                onClick={() => !editLoading && setEditUser(null)}
                disabled={editLoading}
                className="close-btn"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditFormChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>New Password (Optional)</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={editForm.newPassword}
                    onChange={handleEditFormChange}
                    className="form-input"
                    placeholder="Leave blank to keep current"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={editForm.confirmPassword}
                    onChange={handleEditFormChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditFormChange}
                    className="form-input"
                  >
                    <option value="unverified">Unverified</option>
                    <option value="active">Active</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  disabled={editLoading}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={editLoading} className="btn-primary">
                  {editLoading ? (
                    <>
                      <div className="spinner small"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => !createLoading && setShowCreateModal(false)}>
          <div className="modal large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New User</h3>
              <button
                onClick={() => !createLoading && setShowCreateModal(false)}
                disabled={createLoading}
                className="close-btn"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={createForm.name}
                    onChange={handleCreateFormChange}
                    className="form-input"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={createForm.email}
                    onChange={handleCreateFormChange}
                    className="form-input"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={createForm.password}
                    onChange={handleCreateFormChange}
                    className="form-input"
                    placeholder="Enter password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={createForm.confirmPassword}
                    onChange={handleCreateFormChange}
                    className="form-input"
                    placeholder="Confirm password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={createForm.role}
                    onChange={handleCreateFormChange}
                    className="form-input"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={createLoading}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={createLoading} className="btn-primary">
                  {createLoading ? (
                    <>
                      <div className="spinner small"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUser && (
        <div className="modal-overlay" onClick={() => !deleteLoading && setDeleteUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete User</h3>
              <button
                onClick={() => !deleteLoading && setDeleteUser(null)}
                disabled={deleteLoading}
                className="close-btn"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p className="delete-message">
                Are you sure you want to delete <strong>{deleteUser.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setDeleteUser(null)}
                disabled={deleteLoading}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="btn-danger"
              >
                {deleteLoading ? (
                  <>
                    <div className="spinner small"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
