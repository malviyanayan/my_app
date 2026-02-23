import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import AllUsers from "./dashboard/AllUsers";
import Profile from "./dashboard/Profile";
import Settings from "./dashboard/Settings";
import Products from "./dashboard/Products";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [activeTab, setActiveTab] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!role) navigate("/auth");
  }, [role, navigate]);

  const userMenu = ["Profile", "Settings"];
  const adminMenu = ["All Users", "Products", "Settings"];

  const menuItems = role === "admin" ? adminMenu : userMenu;

  useEffect(() => {
    if (menuItems.length > 0) {
      setActiveTab(menuItems[0]);
    }
  }, [role]);

  const renderComponent = () => {
    switch (activeTab) {
      case "All Users":
        return <AllUsers />;
      case "Products":
        return <Products />;
      case "Profile":
        return <Profile role={role} />;
      case "Settings":
        return <Settings />;
      default:
        return <h2>Welcome</h2>;
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      
      <div className="dashboard-container">
        <Sidebar
          role={role}
          menuItems={menuItems}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {isSidebarOpen && (
          <div 
            className="sidebar-overlay" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="dashboard-content">
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Menu</span>
          </button>

          <div className="content-wrapper">
            {renderComponent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
