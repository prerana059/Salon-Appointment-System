import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../css/LandingNavbar.module.css";

export default function LandingNavbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header className={styles.navbar}>
      <Link to="/" className={styles.brand} aria-label="Salon Booking home">
        Salon Booking
      </Link>

      <nav className={styles.navLinks} aria-label="Primary">
        <Link
          to="/"
          className={`${styles.navLink} ${isActive("/") ? styles.active : ""}`}
        >
          Home
        </Link>
        <Link
          to="/about"
          className={`${styles.navLink} ${isActive("/about") ? styles.active : ""}`}
        >
          About Us
        </Link>
        <Link to="/login" className={`${styles.button} ${styles.ghostButton}`}>
          Login
        </Link>
        <Link to="/register" className={`${styles.button} ${styles.primaryButton}`}>
          Register
        </Link>
      </nav>
    </header>
  );
}

