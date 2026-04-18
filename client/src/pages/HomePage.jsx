import React from "react";
import { Link } from "react-router-dom";
import LandingNavbar from "../components/LandingNavbar";
import styles from "../css/HomePage.module.css";

export default function HomePage() {
  return (
    <div
      className={styles.page}
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/bg.jpg)` }}
    >
      <LandingNavbar />

      <main className={styles.hero} role="main">
        <div className={styles.heroInner}>
          <p className={styles.kicker}>Fast. Simple. Reliable.</p>
          <h1 className={styles.title}>Book Your Salon Appointment Easily</h1>
          <p className={styles.subtitle}>
            Discover services, choose a time that fits your schedule, and confirm in
            seconds — all in one place.
          </p>

          <div className={styles.ctaRow}>
            <Link
              to="/register"
              className={`${styles.button} ${styles.primaryButton} ${styles.cta}`}
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className={`${styles.button} ${styles.ghostButton} ${styles.cta}`}
            >
              Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

