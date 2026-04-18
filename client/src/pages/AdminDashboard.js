import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServices: 0,
    activeAppointments: 0,
    totalRevenue: 0
  });

  const fetchStats = async () => {
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/appointments/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (requestError) {
      console.error(requestError);
      setError("Failed to load dashboard stats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: "U",
      gradient: "linear-gradient(135deg, #f8cde2 0%, #e8c8f4 100%)"
    },
    {
      title: "Total Revenue",
      value: `Rs ${stats.totalRevenue}`,
      icon: "R",
      gradient: "linear-gradient(135deg, #cce2ff 0%, #b8d8ff 100%)"
    },
    {
      title: "Active Appointments",
      value: stats.activeAppointments,
      icon: "A",
      gradient: "linear-gradient(135deg, #dfccfa 0%, #cdb3f4 100%)"
    },
    {
      title: "Total Services",
      value: stats.totalServices,
      icon: "S",
      gradient: "linear-gradient(135deg, #f9d7ea 0%, #e6d3fb 100%)"
    }
  ];

  return (
    <div className="ui-page">
      <div className="admin-layout">
        <AdminSidebar />

        <main className="ui-card" style={contentWrapStyle}>
          <h2 className="ui-title">Admin Dashboard</h2>
          <p className="ui-subtitle">
            Overview of users, revenue, appointment activity, and services.
          </p>

          {error ? <div className="ui-toast ui-toast-error">{error}</div> : null}

          <div style={gridStyle}>
            {loading
              ? [1, 2, 3, 4].map((item) => (
                  <div key={item} className="ui-card" style={statCardStyle}>
                    <div className="ui-skeleton" style={{ height: "16px", width: "45%" }} />
                    <div
                      className="ui-skeleton"
                      style={{ height: "34px", width: "60%", marginTop: "12px" }}
                    />
                  </div>
                ))
              : statCards.map((card) => (
                  <div key={card.title} style={{ ...statCardStyle, background: card.gradient }}>
                    <div style={iconStyle}>{card.icon}</div>
                    <p style={cardTitleStyle}>{card.title}</p>
                    <h3 style={cardValueStyle}>{card.value}</h3>
                  </div>
                ))}
          </div>

          <div style={{ marginTop: "30px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              className="ui-btn ui-btn-primary"
              onClick={() => navigate("/admin/appointments")}
            >
              Manage Appointments
            </button>
            <button
              className="ui-btn ui-btn-secondary"
              onClick={() => navigate("/admin/availability")}
            >
              Set Availability
            </button>
            <button
              className="ui-btn ui-btn-secondary"
              onClick={() => navigate("/admin/calendar")}
            >
              View Calendar
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

const contentWrapStyle = {
  padding: "24px"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginTop: "18px"
};

const statCardStyle = {
  padding: "20px",
  borderRadius: "14px",
  color: "#553b63",
  minHeight: "130px"
};

const iconStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.45)",
  display: "grid",
  placeItems: "center",
  fontWeight: 800
};

const cardTitleStyle = {
  margin: "12px 0 6px",
  fontSize: "0.95rem",
  opacity: 0.95
};

const cardValueStyle = {
  margin: 0,
  fontSize: "1.5rem",
  fontWeight: 700
};

export default AdminDashboard;