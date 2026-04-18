import { useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/auth/login", {
        email: email.trim(),
        password,
      });

      login(res.data.user, res.data.token);

      if (res.data.user.role === "admin") navigate("/admin-dashboard");
      else if (res.data.user.role === "staff") navigate("/staff-dashboard");
      else navigate("/customer");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ui-page" style={styles.page}>
      <div className="ui-card login-card-modern" style={styles.loginCard}>
        <div style={styles.brandPanel}>
          <p style={styles.brandLabel}>Salon Booking</p>
          <h1 style={styles.brandTitle}>Welcome back</h1>
          <p style={styles.brandSubtitle}>
            Please enter your email and password to login.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.formPanel}>
          <h2 className="ui-title" style={{ fontSize: "1.55rem" }}>
            Login
          </h2>
          <p className="ui-subtitle" style={{ marginBottom: "16px" }}>
            {/* Access your account securely. */}
          </p>

          {error ? <div className="ui-toast ui-toast-error">{error}</div> : null}

          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              className="ui-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter you email address"
              autoComplete="email"
              required
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              className="ui-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            className="ui-btn ui-btn-primary"
            type="submit"
            disabled={loading}
            style={styles.submitButton}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p style={styles.footerText}>
            New to the platform?{" "}
            <Link to="/register" className="login-link-inline">
              Create account
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
  loginCard: {
    width: "100%",
    maxWidth: "920px",
    overflow: "hidden"
  },
  brandPanel: {
    padding: "34px 28px",
    background: "linear-gradient(160deg, #ffd9ec 0%, #e9d6fb 55%, #d5e8ff 100%)",
    color: "#5e3f69",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: "460px"
  },
  brandLabel: {
    margin: 0,
    fontSize: "0.82rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    opacity: 0.85
  },
  brandTitle: {
    margin: "14px 0 8px",
    fontSize: "2rem",
    lineHeight: 1.2
  },
  brandSubtitle: {
    margin: 0,
    color: "#795983",
    fontSize: "0.96rem",
    lineHeight: 1.5
  },
  formPanel: {
    padding: "34px 28px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  field: {
    marginBottom: "12px"
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#5d4768"
  },
  submitButton: {
    marginTop: "10px",
    width: "100%",
    padding: "11px 14px"
  },
  footerText: {
    marginTop: "14px",
    color: "#8a7291",
    fontSize: "0.9rem"
  }
};

export default Login;