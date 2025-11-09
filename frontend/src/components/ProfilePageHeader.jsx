import React from "react";
import { FaHome } from "react-icons/fa";

export function ProfilePageHeader() {
  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <a href="/" style={styles.homeLink}>
          <FaHome style={styles.icon} />
        </a>
      </div>
      <div style={styles.center}>
        <h1 style={styles.title}>Profile</h1>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#000",
    color: "#fff",
    padding: "16px 24px",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "40px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    zIndex: 1000,
  },
  left: {
    display: "flex",
    alignItems: "center",
  },
  homeLink: {
    color: "#fff",
    textDecoration: "none",
    transition: "color 0.2s ease",
  },
  icon: {
    fontSize: "22px",
  },
  center: {
    flex: 1,
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "500",
    letterSpacing: "1px",
  },
};
