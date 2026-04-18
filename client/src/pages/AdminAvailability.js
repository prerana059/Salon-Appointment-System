import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import { useNotification } from "../context/NotificationContext";
import { getApiErrorMessage } from "../utils/errorMessages";

const AdminAvailability = () => {
  const [staff, setStaff] = useState([]);
  const [availabilityList, setAvailabilityList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({
    staff_id: "",
    available_date: "",
    start_time: "",
    end_time: ""
  });
  const token = localStorage.getItem("token");
  const { success, error: notifyError, warning } = useNotification();

  useEffect(() => {
    fetchStaff();
    fetchAvailability();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users/staff", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Failed to load staff list."));
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/availability", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailabilityList(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Failed to fetch availability."));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!form.staff_id || !form.available_date || !form.start_time || !form.end_time) {
      warning("Please fill all availability fields.");
      return;
    }

    setSaving(true);
    try {
      await axios.post("http://localhost:5000/api/availability", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      success("Availability added.");
      setForm({
        staff_id: "",
        available_date: "",
        start_time: "",
        end_time: ""
      });
      fetchAvailability();
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Failed to add availability."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (deletingId) return;
    const confirmed = window.confirm("Delete this availability slot?");
    if (!confirmed) {
      warning("Delete cancelled.");
      return;
    }
    setDeletingId(id);
    try {
      await axios.delete(`http://localhost:5000/api/availability/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      success("Availability deleted.");
      fetchAvailability();
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Delete failed."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="ui-page">
      <div className="admin-layout">
        <AdminSidebar />
        <div className="ui-card" style={styles.card}>
          <h2 className="ui-title">Set Staff Availability</h2>
          <p className="ui-subtitle">Configure working slots in a clean pastel schedule layout.</p>

          <form onSubmit={handleSubmit} style={styles.formGrid}>
            <select
              className="ui-select"
              value={form.staff_id}
              onChange={(event) => setForm({ ...form, staff_id: event.target.value })}
              required
            >
              <option value="">Select Staff</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>

            <input
              className="ui-input"
              type="date"
              value={form.available_date}
              onChange={(event) => setForm({ ...form, available_date: event.target.value })}
              required
            />

            <input
              className="ui-input"
              type="time"
              value={form.start_time}
              onChange={(event) => setForm({ ...form, start_time: event.target.value })}
              required
            />

            <input
              className="ui-input"
              type="time"
              value={form.end_time}
              onChange={(event) => setForm({ ...form, end_time: event.target.value })}
              required
            />

            <button className="ui-btn ui-btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Add Availability"}
            </button>
          </form>

          <h3 style={{ marginTop: "22px", color: "#5f4667" }}>Existing Availability</h3>

          {availabilityList.length === 0 ? (
            <div className="ui-empty">
              <span className="ui-empty-icon">C</span>
              No availability found.
            </div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Staff</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Start</th>
                    <th style={styles.th}>End</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availabilityList.map((availability) => (
                    <tr key={availability.id}>
                      <td style={styles.td}>{availability.staff_name}</td>
                      <td style={styles.td}>{String(availability.available_date).slice(0, 10)}</td>
                      <td style={styles.td}>{String(availability.start_time).slice(0, 5)}</td>
                      <td style={styles.td}>{String(availability.end_time).slice(0, 5)}</td>
                      <td style={styles.td}>
                        <button
                          className="ui-btn ui-btn-danger"
                          onClick={() => handleDelete(availability.id)}
                          disabled={deletingId === availability.id}
                        >
                          {deletingId === availability.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    padding: "20px"
  },
  formGrid: {
    marginTop: "14px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px"
  },
  tableWrap: {
    marginTop: "12px",
    overflowX: "auto",
    border: "1px solid #eddcf1",
    borderRadius: "12px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "680px"
  },
  th: {
    textAlign: "left",
    padding: "12px",
    backgroundColor: "#fcf6fe",
    borderBottom: "1px solid #eddcf1",
    color: "#6c5474",
    fontSize: "0.82rem",
    textTransform: "uppercase"
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #f2e7f6",
    fontSize: "0.92rem"
  }
};

export default AdminAvailability;