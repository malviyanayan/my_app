import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import API from "../api";
import toast from "react-hot-toast";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");

    if (!emailParam || !tokenParam) {
      toast.error("Invalid reset link");
      navigate("/auth");
      return;
    }

    setEmail(emailParam);
    setToken(tokenParam);
  }, [searchParams, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await API.post("/auth/reset-password", {
        email,
        token,
        newPassword: data.password,
      });

      toast.success(res.data.message || "Password reset successfully!");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to reset password. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-card">
          <h2 className="reset-password-title">Reset Your Password</h2>
          <p className="reset-password-subtitle">
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="reset-password-form">
            {/* New Password */}
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className={`form-input ${errors.password ? "error" : ""}`}
                placeholder="Enter new password"
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="error-message">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                placeholder="Confirm new password"
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <p className="error-message">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="back-link"
              disabled={isSubmitting}
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
