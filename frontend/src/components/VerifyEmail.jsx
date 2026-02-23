import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";
import "./VerifyEmail.css";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const email = searchParams.get("email");
      const code = searchParams.get("code");

      if (!email || !code) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      try {
        const res = await API.post("/auth/verify-email", {
          email,
          code,
        });

        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
        toast.success("Email verified successfully!");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Verification failed. Please try again."
        );
        toast.error(err.response?.data?.message || "Verification failed");
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="verify-page">
      <div className="verify-container">
        <div className="verify-card">
          {status === "verifying" && (
            <>
              <div className="spinner"></div>
              <h2 className="verify-title">Verifying Your Email</h2>
              <p className="verify-message">Please wait while we verify your email address...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="success-icon">✓</div>
              <h2 className="verify-title success">Email Verified!</h2>
              <p className="verify-message">{message}</p>
              <p className="redirect-message">Redirecting to login page...</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="error-icon">✕</div>
              <h2 className="verify-title error">Verification Failed</h2>
              <p className="verify-message">{message}</p>
              <button
                onClick={() => navigate("/auth")}
                className="back-to-login-btn"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
