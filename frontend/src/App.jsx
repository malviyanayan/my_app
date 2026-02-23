import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Auth from "./components/Auth";
import VerifyEmail from "./components/VerifyEmail";
import ResetPassword from "./components/ResetPassword";
import GoogleCallback from "./components/GoogleCallback";
import Admin from "./components/Admin";
import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import "./App.css";

function AppContent() {
  const location = useLocation();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1f2937',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            padding: '16px',
          },
        }}
      />

      <Routes>
        <Route path="/" element={
          <div className="app-layout">
            <Navbar />
            <main className="app-main">
              <Home />
            </main>
          </div>
        } />
        <Route path="/products" element={
          <div className="app-layout">
            <Navbar />
            <main className="app-main">
              <Products />
            </main>
          </div>
        } />
        <Route path="/auth/*" element={
          <div className="app-layout">
            <Navbar />
            <main className="app-main">
              <Auth />
            </main>
          </div>
        } />
        <Route path="/auth/verify" element={<VerifyEmail />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/google/success" element={<GoogleCallback />} />
        <Route path="/admin" element={
          <div className="app-layout">
            <Navbar />
            <main className="app-main">
              <Admin />
            </main>
          </div>
        } />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
