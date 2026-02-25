import { FaSignOutAlt, FaTimes, FaComments, FaUsers, FaBox, FaCog, FaUser } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = ({ role, menuItems, activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const getMenuIcon = (item) => {
    switch (item) {
      case "All Users":
        return <FaUsers />;
      case "Chat Support":
        return <FaComments />;
      case "Products":
        return <FaBox />;
      case "Settings":
        return <FaCog />;
      case "Profile":
        return <FaUser />;
      default:
        return null;
    }
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
              <span className="sidebar-item-icon">{getMenuIcon(item)}</span>
              <span className="sidebar-item-text">{item}</span>
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
