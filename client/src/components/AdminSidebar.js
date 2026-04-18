import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/admin-dashboard" },
  { label: "Appointments", path: "/admin/appointments" },
  { label: "Calendar", path: "/admin/calendar" },
  { label: "Availability", path: "/admin/availability" },
  { label: "Services", path: "/admin/services" }
];

function AdminSidebar() {
  return (
    <aside className="ui-card admin-sidebar">
      <h3 style={{ marginTop: 0, marginBottom: "14px" }}>Admin Panel</h3>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `admin-nav-link${isActive ? " active" : ""}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}

export default AdminSidebar;
