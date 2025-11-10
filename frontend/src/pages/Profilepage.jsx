import { useRef } from "react";
import { ProfilePageHeader } from "../components/ProfilePageHeader";
import { Footer } from "../components/Footer";
import { FaPlus, FaUserCircle } from "react-icons/fa";

export function Profilepage() {
  const gamesListRef = useRef(null);

  const scrollGames = (direction) => {
    if (gamesListRef.current) {
      const container = gamesListRef.current;
      const scrollAmount = container.offsetWidth * 0.15; 
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div style={styles.page}>
      <ProfilePageHeader />

      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.imageContainer}>
              <FaUserCircle style={styles.defaultIcon} />
              <button style={styles.addButton}>
                <FaPlus size={14} />
              </button>
            </div>

            <div style={styles.userMeta}>
              <h2 style={styles.korisnicko_ime}>Ime Prezime</h2>
              <p style={styles.smallInfo}>
                <strong style={styles.label}>Email:</strong> email@gmail.com
              </p>
              <p style={styles.smallInfo}>
                <strong style={styles.label}>Lokacija:</strong> Zagreb, Hrvatska
              </p>
              <p style={styles.smallInfo}>
                <strong style={styles.label}>Aktivne zamjene:</strong> broj
              </p>
            </div>
          </div>

          <p style={styles.opis}>
            Kratak opis korisnikovih preferencija
          </p>
        </div>

        <div style={styles.gamesSection}>
          <h3 style={styles.gamesTitle}>Your Games</h3>
          <div style={styles.gamesWrapper}>
            <button
              style={styles.scrollButton}
              onClick={() => scrollGames("left")}
            >
              ‹
            </button>

            <div style={styles.gamesList} ref={gamesListRef}>
              <div style={styles.gameItem}>No Game</div>
              <div style={styles.gameItem}>No Game</div>
              <div style={styles.gameItem}>No Game</div>
              <div style={styles.gameItem}>No Game</div>
              <div style={styles.gameItem}>No Game</div>
              <div style={styles.gameItem}>No Game</div>
              <div style={styles.gameItem}>No Game</div>
              <div style={styles.gameItem}>No Game</div>
            </div>

            <button
              style={styles.scrollButton}
              onClick={() => scrollGames("right")}
            >
              ›
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


const styles = {
  page: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f8f9fa",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: "90px",
    paddingBottom: "50px",
  },

  card: {
    width: "100%",
    maxWidth: "600px",
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 6px 30px rgba(0,0,0,0.25)",
    padding: "28px",
    textAlign: "left",
    boxSizing: "border-box",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "18px",
  },

  imageContainer: {
    position: "relative",
    width: "140px",
    height: "140px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  slika: {
    width: "140px",
    height: "140px",
    borderRadius: "12px",
    objectFit: "cover",
    border: "4px solid #e0e7ff",
    boxShadow: "0 4px 12px rgba(0,0,0,1)",
  },

  defaultIcon: {
    fontSize: "120px",
    color: "#c0c0c0",
  },

  addButton: {
    position: "absolute",
    bottom: "6px",
    right: "6px",
    backgroundColor: "#a81c21ff",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  },

  userMeta: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: "6px",
    minWidth: 0,
    marginTop: "10px",
  },

  korisnicko_ime: {
    fontSize: "1.7rem",
    fontWeight: 700,
    color: "#111",
    margin: 0,
    letterSpacing: "0.5px",
  },

  smallInfo: {
    margin: 0,
    color: "#444",
    fontSize: "0.96rem",
  },

  opis: {
    color: "#555",
    marginTop: "12px",
    lineHeight: 1.5,
    fontSize: "1rem",
  },

  label: {
    fontWeight: 600,
    marginRight: "6px",
    color: "#222",
  },

 gamesSection: {
  marginTop: "40px",
  width: "90%",
  maxWidth: "800px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
},

gamesTitle: {
  textAlign: "center",
  fontSize: "1.4rem",
  fontWeight: "700",
  color: "#222",
  marginBottom: "8px",
  letterSpacing: "0.5px",
},

gamesWrapper: {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "16px",
  width: "100%",
  backgroundColor: "#a81c21ff", 
  borderRadius: "12px",
  padding: "16px",
  boxShadow: "0 4px 20px rgba(1, 1, 1, 1)", 
},

scrollButton: {
  backgroundColor: "#fff", 
  border: "none",
  color: "black",
  fontSize: "1.8rem",
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",
  boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
},
scrollButtonHover: {
  backgroundColor: "#d62839",
},

gamesList: {
  display: "flex",
  gap: "12px",
  overflowX: "auto",
  scrollBehavior: "smooth",
  width: "80%",
  padding: "10px 0",
},

gameItem: {
  flex: "0 0 120px",
  height: "120px",
  backgroundColor: "#fff",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "600",
  color: "#333",
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  transition: "transform 0.2s ease",
},
};
