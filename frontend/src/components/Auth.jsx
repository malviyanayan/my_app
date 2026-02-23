import { useState } from "react";
import { useForm } from "react-hook-form";
import API from "../api";
import toast from "react-hot-toast";
import "./Auth.css";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isUnverified, setIsUnverified] = useState(false);
  const [showVerificationSent, setShowVerificationSent] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm();



  const password = watch("password");

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      toast.error("Please enter your email");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsResending(true);
    try {
      const res = await API.post("/auth/forgot-password", {
        email: forgotPasswordEmail,
      });
      toast.success(res.data.message || "Password reset link sent to your email");
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (isResending) return;
    
    setIsResending(true);
    try {
      const res = await API.post("/auth/resend-verification", {
        email: registeredEmail,
      });
      toast.success(res.data.message || "Verification link sent to your email");
      setShowVerificationSent(true);
      setIsUnverified(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send verification link");
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (isLogin) {
        const res = await API.post("/auth/login", {
          email: data.email,
          password: data.password,
        });

        const { token, role, message, name } = res.data;

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("userName", name || data.email.split("@")[0]);

        toast.success(message || "Login successful");

        window.location.href = "/";
      } else {
        const res = await API.post("/auth/register", {
          name: data.fullName,
          email: data.email,
          password: data.password,
        });

        toast.success(res.data.message || "Registration successful! Please check your email for verification link.");
        setRegisteredEmail(data.email);
        setShowVerificationSent(true);
        setIsLogin(false);
        reset();
      }
    } catch (err) {
      // Check if user is unverified
      if (err.response?.status === 403 && err.response?.data?.message?.includes("not verified")) {
        setIsUnverified(true);
        setRegisteredEmail(data.email);
        toast.error(err.response.data.message);
      } else {
        toast.error(err.response?.data?.message || "Something went wrong");
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {showForgotPassword ? (
            // Forgot Password Screen
            <>
              <h2 className="auth-title">Reset Password</h2>
              <p className="verification-subtitle">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleForgotPassword} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="form-input"
                    placeholder="Enter your email"
                  />
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isResending}
                >
                  {isResending ? "Sending..." : "Send Reset Link"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail("");
                  }}
                  className="back-btn-link"
                >
                  Back to Login
                </button>
              </form>
            </>
          ) : showVerificationSent ? (
            // Verification Link Sent Screen
            <>
              <h2 className="auth-title">Check Your Email</h2>
              <p className="verification-subtitle">
                We've sent a verification link to <strong>{registeredEmail}</strong>
              </p>
              <p className="verification-info">
                Please check your email and click the verification link to activate your account.
              </p>

              <button
                type="button"
                onClick={() => {
                  setShowVerificationSent(false);
                  setIsLogin(true);
                }}
                className="submit-btn"
              >
                Back to Login
              </button>

              <button
                type="button"
                onClick={handleVerifyAccount}
                className="resend-link-btn"
                disabled={isResending}
              >
                {isResending ? "Sending..." : "Resend Verification Link"}
              </button>
            </>
          ) : (
            // Login/Register Form
            <>
              {/* Toggle Buttons */}
              <div className="auth-toggle">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    reset();
                  }}
                  className={`toggle-btn ${isLogin ? "active" : ""}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    reset();
                  }}
                  className={`toggle-btn ${!isLogin ? "active" : ""}`}
                >
                  Register
                </button>
              </div>

              {/* Title */}
              <h2 className="auth-title">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                {/* Full Name - Register Only */}
                {!isLogin && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      {...register("fullName", {
                        required: "Full Name is required",
                        pattern: {
                          value: /^[a-zA-Z\s]+$/,
                          message: "Full Name should only contain letters and spaces",
                        },
                      })}
                      className={`form-input ${errors.fullName ? "error" : ""}`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="error-message">{errors.fullName.message}</p>
                    )}
                  </div>
                )}

                {/* Email */}
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="text"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Email is invalid",
                      },
                    })}
                    className={`form-input ${errors.email ? "error" : ""}`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="error-message">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: !isLogin
                        ? {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          }
                        : undefined,
                    })}
                    className={`form-input ${errors.password ? "error" : ""}`}
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="error-message">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password - Register Only */}
                {!isLogin && (
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      {...register("confirmPassword", {
                        required: "Confirm Password is required",
                        validate: (value) =>
                          value === password || "Passwords do not match",
                      })}
                      className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && (
                      <p className="error-message">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button type="submit" className="submit-btn">
                  {isLogin ? "Login" : "Register"}
                </button>

                {/* Forgot Password Link - Login Only */}
                {isLogin && (
                  <div className="forgot-password-container">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="forgot-password-link"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {/* Divider */}
                <div className="divider">
                  <span className="divider-text">OR</span>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="google-btn"
                >
                  <svg className="google-icon" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>

                {/* Unverified Account Alert */}
                {isLogin && isUnverified && (
                  <div className="unverified-alert">
                    <p className="unverified-message">
                      Your account is not verified. Please verify your email to continue.
                    </p>
                    <button
                      type="button"
                      onClick={handleVerifyAccount}
                      className="verify-btn"
                    >
                      Verify Account
                    </button>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
