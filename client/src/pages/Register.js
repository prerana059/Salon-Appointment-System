import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import { getApiErrorMessage } from "../utils/errorMessages";

function Register() {
  const navigate = useNavigate();
  const { success, error: notifyError, warning } = useNotification();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword, phone } = formData;
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      return "Please fill all required fields.";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }
    if (password !== confirmPassword) {
      return "Password and confirm password do not match.";
    }
    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      return "Please provide a valid phone number.";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      warning(validationError);
      return;
    }

    setLoading(true);
    try {
      await axios.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || null,
        role: "customer"
      });
      success("Account created successfully. Please login to continue.");
      navigate("/");
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, "Registration failed. Please try again.");
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ui-page" style={styles.page}>
      <div className="ui-card auth-card-pastel" style={styles.card}>
        <div className="auth-brand-pink" style={styles.brandPanel}>
          <p style={styles.brandLabel}>Salon Booking</p>
          <h1 style={styles.brandTitle}>Create your account</h1>
          <p style={styles.brandSubtitle}>
            Join our platform to book appointments quickly and manage your beauty schedule.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.formPanel}>
          <h2 className="ui-title" style={{ fontSize: "1.5rem" }}>
            Register
          </h2>
          <p className="ui-subtitle" style={{ marginBottom: "14px" }}>
            Start with your customer profile.
          </p>

          {error ? <div className="ui-toast ui-toast-error">{error}</div> : null}

          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label htmlFor="name" style={styles.label}>
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                className="ui-input"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="email" style={styles.label}>
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                className="ui-input"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                autoComplete="email"
                required
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="phone" style={styles.label}>
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                className="ui-input"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                autoComplete="tel"
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="password" style={styles.label}>
                Password *
              </label>
              <input
                id="password"
                name="password"
                className="ui-input"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
              />
            </div>

            <div style={styles.fieldFull}>
              <label htmlFor="confirmPassword" style={styles.label}>
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                className="ui-input"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button
            className="ui-btn"
            type="submit"
            disabled={loading}
            style={styles.submitButton}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p style={styles.footerText}>
            Already have an account?{" "}
            <Link to="/" className="login-link-inline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "grid",
    placeItems: "center",
    padding: "20px"
  },
  card: {
    width: "100%",
    maxWidth: "1020px",
    overflow: "hidden",
    minHeight: "560px"
  },
  brandPanel: {
    padding: "34px 28px",
    color: "#6f3b72",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  brandLabel: {
    margin: 0,
    fontSize: "0.82rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    opacity: 0.9
  },
  brandTitle: {
    margin: "14px 0 8px",
    fontSize: "2rem",
    lineHeight: 1.2
  },
  brandSubtitle: {
    margin: 0,
    color: "#85508c",
    fontSize: "0.96rem",
    lineHeight: 1.5
  },
  formPanel: {
    padding: "34px 28px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(180px, 1fr))",
    gap: "10px 12px"
  },
  field: {
    marginBottom: "2px"
  },
  fieldFull: {
    gridColumn: "1 / -1"
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#5d4768"
  },
  submitButton: {
    marginTop: "14px",
    background: "linear-gradient(135deg, #f4b6d3 0%, #d8b8f3 55%, #bcdcff 100%)",
    color: "#4f3a5f",
    width: "100%",
    padding: "11px 14px"
  },
  footerText: {
    marginTop: "14px",
    color: "#64748b",
    fontSize: "0.9rem"
  }
};

export default Register;
