import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaTachometerAlt, FaSignInAlt, FaSignOutAlt, FaBars, FaTimes, FaBox, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");
    const role = localStorage.getItem("role");
    
    setIsLoggedIn(!!token);
    setUserName(name || "User");
    setUserRole(role || "");
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return parts.length > 1 
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo - Left Side */}
        <Link to="/" className="navbar-logo" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="logo-icon">
            <span>M</span>
          </div>
          <span className="logo-text">MyApp</span>
        </Link>

        {/* Right Side - Desktop */}
        <div className="navbar-right">
          {/* Navigation Links */}
          <div className="navbar-menu">
            <Link
              to="/"
              className={`nav-link ${isActive("/") ? "active" : ""}`}
            >
              <FaHome />
              <span>Home</span>
            </Link>

            <Link
              to="/products"
              className={`nav-link ${isActive("/products") ? "active" : ""}`}
            >
              <FaBox />
              <span>Products</span>
            </Link>

            {isLoggedIn && (
              <Link
                to="/dashboard"
                className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
              >
                <FaTachometerAlt />
                <span>Dashboard</span>
              </Link>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>

          {/* Auth Section */}
          {!isLoggedIn && (
            <div className="navbar-auth">
              <Link to="/auth" className="btn-login">
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <Link
            to="/"
            className={`mobile-link ${isActive("/") ? "active" : ""}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaHome />
            <span>Home</span>
          </Link>

          <Link
            to="/products"
            className={`mobile-link ${isActive("/products") ? "active" : ""}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaBox />
            <span>Products</span>
          </Link>

          {isLoggedIn && (
            <Link
              to="/dashboard"
              className={`mobile-link ${isActive("/dashboard") ? "active" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaTachometerAlt />
              <span>Dashboard</span>
            </Link>
          )}

          <div className="mobile-divider"></div>

          <button
            onClick={toggleTheme}
            className="mobile-theme-toggle"
          >
            {theme === 'light' ? <FaMoon /> : <FaSun />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          {!isLoggedIn && (
            <Link
              to="/auth"
              className="mobile-btn-login"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>Get Started</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
