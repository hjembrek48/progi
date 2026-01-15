import { ProfilePageHeader } from "../components/ProfilePageHeader";
import { Footer } from "../components/Footer";
import { FaPlus, FaUserCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import apiAuth from "../services/apiAuth.js";

export function Profilepage() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");

  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiAuth.get("profile");
        setProfile(res.data);
        //setUsername(res.data.username || "");
        setDescription(res.data.description || "");

        if(res.data.username){
          setUsername(res.data.username)
        } else{
          const u = await apiAuth.get("username/");
          setUsername(u.data.username || "");
        }
      } catch (err) {
        console.error("Ne mogu dohvatiti profil:", err);
      }
    };

    fetchProfile();
  }, []);

  const saveUsername = async () => {
    setUsernameError("");
    setUsernameSuccess("");

    const trimmed = username.trim();

    if (trimmed.length < 3) {
      setUsernameError("Username mora imati barem 3 znaka.");
      return;
    }

    // Ako se nije promijenio, ne šalji
    if (trimmed === (profile?.username || "")) {
      setUsernameSuccess("Nema promjena.");
      return;
    }

    try {
      setIsSavingUsername(true);

      const res = await apiAuth.patch("username/", { username: trimmed });
      const newUsername = res.data.username;

      setUsername(newUsername);
      setProfile((p) => ({ ...p, username: newUsername }));
      setUsernameSuccess("Username spremljen!");
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.username?.[0] ||
        data?.detail ||
        "Greška pri spremanju usernamea.";

      setUsernameError(msg);
    } finally {
      setIsSavingUsername(false);
    }
  };

  if (!profile) {
    return <div style={{ color: "white" }}>Učitavanje...</div>;
  }

  return (
    <div style={styles.page}>
      <ProfilePageHeader />

      <main style={styles.main}>
        <div
          style={styles.card}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div style={styles.cardHeader}>
            <div style={styles.imageContainer}>
              <FaUserCircle style={styles.defaultIcon} />
              <button style={styles.addButton}>
                <FaPlus size={14} />
              </button>
            </div>

            <div style={styles.userMeta}>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError("");
                  setUsernameSuccess("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    saveUsername();
                  }
                }}
                placeholder="Korisničko ime"
                style={styles.korisnicko_ime_input}
              />

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 10,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={saveUsername}
                  disabled={isSavingUsername}
                  style={{
                    ...styles.saveButton,
                    opacity: isSavingUsername ? 0.7 : 1,
                    cursor: isSavingUsername ? "not-allowed" : "pointer",
                  }}
                >
                  {isSavingUsername ? "Spremam..." : "Spremi username"}
                </button>

                {usernameError ? (
                  <span style={{ color: "#ffb4b4", fontWeight: 600 }}>
                    {usernameError}
                  </span>
                ) : null}

                {usernameSuccess ? (
                  <span style={{ color: "#b7ffcc", fontWeight: 600 }}>
                    {usernameSuccess}
                  </span>
                ) : null}
              </div>

              <p style={styles.smallInfo}>
                <strong style={styles.label}>Email:</strong> {profile.email}
              </p>
              <p style={styles.smallInfo}>
                <strong style={styles.label}>Lokacija:</strong> {profile.address}
              </p>
              <p style={styles.smallInfo}>
                <strong style={styles.label}>Aktivne zamjene:</strong> broj
              </p>
            </div>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opis..."
            style={styles.opis_input}
          />
        </div>

        <div style={styles.profileButtons}>
          <button
            style={styles.profileButton}
            onClick={() => navigate("/my-games")}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.07)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            MyGames
          </button>

          <button
            style={styles.profileButton}
            onClick={() => navigate("/category-wishlist")}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.07)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            CategoryWishlist
          </button>
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
    backgroundColor: "#354F52",
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
    backgroundColor: "#52796F",
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
    backgroundColor: "#354F52",
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

  smallInfo: {
    margin: 0,
    color: "#fff",
    fontSize: "0.96rem",
  },

  label: {
    fontWeight: 600,
    marginRight: "6px",
    color: "#fff",
  },

  korisnicko_ime_input: {
    fontSize: "1.7rem",
    fontWeight: 700,
    color: "#fff",
    backgroundColor: "transparent",
    border: "none",
    outline: "none",
    padding: 0,
    margin: 0,
    letterSpacing: "0.5px",
    width: "100%",
  },

  opis_input: {
    color: "#fff",
    marginTop: "12px",
    lineHeight: 1.5,
    fontSize: "1rem",
    backgroundColor: "transparent",
    border: "none",
    outline: "none",
    resize: "none",
    width: "100%",
    minHeight: "60px",
  },

  profileButtons: {
    marginTop: "16px",
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    width: "100%",
    maxWidth: "600px",
  },

  profileButton: {
    flex: 1,
    padding: "12px 0",
    backgroundColor: "#52796F",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    transition: "transform 0.2s ease, background-color 0.2s ease",
  },

  saveButton: {
    padding: "8px 14px",
    backgroundColor: "#354F52",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: 600,
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    transition: "transform 0.2s ease, background-color 0.2s ease",
  },
};
