import React from "react";
import LandingNavbar from "../components/LandingNavbar";
import styles from "../css/AboutPage.module.css";

function FeatureIcon({ variant }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none" };
  const stroke = "currentColor";

  if (variant === "booking") {
    return (
      <svg {...common} aria-hidden="true">
        <path
          d="M8 7V5a2 2 0 0 1 4 0v2M7 9h10a2 2 0 0 1 2 2v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-8a2 2 0 0 1 2-2Z"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 13h8"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === "staff") {
    return (
      <svg {...common} aria-hidden="true">
        <path
          d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.5 20a7.5 7.5 0 0 1 15 0"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true">
      <path
        d="M7 7h10v6a5 5 0 0 1-10 0V7Z"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 3h6M12 3v4"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.8 12.2h6.4"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <div
      className={styles.page}
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/bg.jpg)` }}
    >
      <LandingNavbar />

      <main className={styles.main} role="main">
        <section className={styles.card}>
          <p className={styles.kicker}>Our Mission</p>
          <h1 className={styles.title}>About Our Salon</h1>

          <p className={styles.description}>
            This Salon Appointment Booking System makes it easy to browse services,
            choose a preferred time, and book appointments with confidence.
          </p>

          <div className={styles.benefits}>
            <div className={styles.benefit}>
              <h2 className={styles.benefitTitle}>Benefits for customers</h2>
              <ul className={styles.list}>
                <li>Book in seconds from any device.</li>
                <li>See availability clearly and avoid back-and-forth calls.</li>
                <li>Manage upcoming appointments in one place.</li>
              </ul>
            </div>
            <div className={styles.benefit}>
              <h2 className={styles.benefitTitle}>Benefits for staff/admin</h2>
              <ul className={styles.list}>
                <li>Keep schedules organized and reduce double-booking.</li>
                <li>Track appointments and service demand with less manual work.</li>
                <li>Deliver a smoother, more professional customer experience.</li>
              </ul>
            </div>
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon} aria-hidden="true">
                <FeatureIcon variant="booking" />
              </div>
              <div>
                <h3 className={styles.featureTitle}>Easy Booking</h3>
                <p className={styles.featureText}>
                  A streamlined flow to pick a service, time, and confirm instantly.
                </p>
              </div>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon} aria-hidden="true">
                <FeatureIcon variant="staff" />
              </div>
              <div>
                <h3 className={styles.featureTitle}>Professional Staff</h3>
                <p className={styles.featureText}>
                  Highlight your team and provide consistent, high-quality service.
                </p>
              </div>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon} aria-hidden="true">
                <FeatureIcon variant="schedule" />
              </div>
              <div>
                <h3 className={styles.featureTitle}>Smart Scheduling</h3>
                <p className={styles.featureText}>
                  Clean availability and structured calendars to keep things running
                  smoothly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

