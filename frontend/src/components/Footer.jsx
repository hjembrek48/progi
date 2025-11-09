import React from "react";
import { FaGithub, FaInfoCircle } from "react-icons/fa";

export function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.left}>
        <p style={styles.text}>© {new Date().getFullYear()} All rights reserved.</p>
      </div>

      <div style={styles.right}>
        <a href="/about" style={styles.link}>
          <FaInfoCircle style={styles.icon} />
          About Us
        </a>
        <a
          href="https://github.com/AndrejP2"
          target="_blank"
          style={styles.iconLink}
        >
          <FaGithub style={styles.icon} />
        </a>
      </div>
    </footer>
  );
}

const styles = {

    footer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 32px",
        backgroundColor: "#1e1e1e",
        color: "#fff",
        fontSize: "16px",
        boxShadow: "0 -2px 6px rgba(0,0,0,0.2)",
        marginTop: "auto",
    },    
    left: { 
        flex: 1
    },
    text: {
        margin: 0 
    },
    right: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },
    link: {
        display: "flex",
        alignItems: "center",
        color: "#fff",
        textDecoration: "none",
        gap: "6px",
        fontWeight: 500,
    },
    iconLink: {
        color: "#fff",
        textDecoration: "none",
        transition: "color 0.2s ease",
    },
    icon: { 
        fontSize: "18px" 
    },
};
