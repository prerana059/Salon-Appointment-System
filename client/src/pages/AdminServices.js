import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import { useNotification } from "../context/NotificationContext";
import { getApiErrorMessage } from "../utils/errorMessages";

function AdminServices() {
  const [services, setServices] = useState([]);
  const [service_name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { success, error: notifyError, warning } = useNotification();

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/services", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Failed to fetch services."));
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const addService = async () => {
    if (saving) return;
    if (!service_name.trim() || !price || !duration) {
      warning("Service name, duration, and price are required.");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/services",
        {
          service_name,
          description,
          price,
          duration
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      success("Service added successfully.");
      setName("");
      setPrice("");
      setDescription("");
      setDuration("");
      fetchServices();
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Error adding service."));
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (id) => {
    if (deletingId) return;
    const confirmed = window.confirm("Delete this service?");
    if (!confirmed) {
      warning("Delete cancelled.");
      return;
    }
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      success("Service deleted.");
      fetchServices();
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
          <h2 className="ui-title">Admin Services</h2>
          <p className="ui-subtitle">Manage service catalog with a pastel themed workspace.</p>

          <div style={styles.formGrid}>
            <input
              className="ui-input"
              type="text"
              placeholder="Service Name"
              value={service_name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              className="ui-input"
              type="text"
              placeholder="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <input
              className="ui-input"
              type="number"
              placeholder="Duration (minutes)"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            />
            <input
              className="ui-input"
              type="number"
              placeholder="Price"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>

          <button
            className="ui-btn ui-btn-primary"
            onClick={addService}
            disabled={saving}
            style={{ marginTop: "10px" }}
          >
            {saving ? "Saving..." : "Add Service"}
          </button>

          <div style={styles.list}>
            {services.length === 0 ? (
              <div className="ui-empty">
                <span className="ui-empty-icon">C</span>
                No services added yet.
              </div>
            ) : (
              services.map((service) => (
                <div key={service.id} style={styles.item}>
                  <div>
                    <p style={styles.itemTitle}>{service.service_name}</p>
                    <p style={styles.itemMeta}>
                      {service.duration} mins | Rs {service.price}
                    </p>
                  </div>
                  <button
                    className="ui-btn ui-btn-danger"
                    onClick={() => deleteService(service.id)}
                    disabled={deletingId === service.id}
                  >
                    {deletingId === service.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: "20px"
  },
  formGrid: {
    marginTop: "14px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "10px"
  },
  list: {
    marginTop: "16px",
    display: "grid",
    gap: "10px"
  },
  item: {
    border: "1px solid #eddcf1",
    borderRadius: "10px",
    padding: "12px",
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
    backgroundColor: "#fcf6fe"
  },
  itemTitle: {
    margin: 0,
    fontWeight: 700,
    color: "#5f4667"
  },
  itemMeta: {
    margin: "5px 0 0",
    color: "#8a7291",
    fontSize: "0.88rem"
  }
};

export default AdminServices;