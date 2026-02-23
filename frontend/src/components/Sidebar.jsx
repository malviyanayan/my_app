import { FaSignOutAlt, FaTimes } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = ({ role, menuItems, activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          {role === "admin" ? "Admin Panel" : "User Panel"}
        </h2>
        <button 
          className="sidebar-close-btn"
          onClick={() => setIsSidebarOpen(false)}
        >
          <FaTimes />
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => {
          const isActive = activeTab === item;

          return (
            <button
              key={index}
              onClick={() => setActiveTab(item)}
              className={`sidebar-item ${isActive ? "active" : ""}`}
            >
              {item}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
