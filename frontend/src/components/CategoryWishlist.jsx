import { useEffect, useState } from "react";
import apiAuth from "../services/apiAuth";
import axios from "axios";
import { getAccessToken, setAccessToken } from "../services/auth.js";

export function CategoryWishlist() {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  const ensureAccessToken = async () => {
    const token = getAccessToken();
    if (token) return token;

    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/token/refresh-cookie/`,
      {},
      { withCredentials: true }
    );

    setAccessToken(res.data.access);
    return res.data.access;
  };

  useEffect(() => {
    const fetchGenresAndProfile = async () => {
      try {
        await ensureAccessToken();

        const [genresRes, profileRes] = await Promise.all([
          apiAuth.get("genres/"),
          apiAuth.get("profile/"),
        ]);

        setGenres(genresRes.data);

        const raw = profileRes.data?.interests || [];
        setSelectedGenres(raw.map((g) => g.id));
      } catch (err) {
        console.error(
          "Greška kod dohvaćanja žanrova/profila",
          err?.response?.status,
          err?.response?.data || err
        );
      }
    };

    fetchGenresAndProfile();
  }, []);

  const toggleGenre = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const saveWishlist = async () => {
    try {
      await ensureAccessToken();

      await apiAuth.patch("profile/", {
        interest_ids: selectedGenres,
      });

      const profileRes = await apiAuth.get("profile/");
      setSelectedGenres(
        (profileRes.data?.interests || []).map((g) => g.id)
      );

    } catch (err) {
      console.error(
        "Greška kod spremanja",
        err?.response?.status,
        err?.response?.data || err
      );
    }
  };

return (
  <div style={styles.page}>
    <div style={styles.shell}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Odaberi omiljene žanrove</h2>
          <p style={styles.caption}>
            Klikni na kartice. Odabrano:{" "}
            <span style={styles.countPill}>{selectedGenres.length}</span>
          </p>
        </div>

        <button style={styles.saveButton} onClick={saveWishlist}>
          Spremi ({selectedGenres.length})
        </button>
      </div>

      <div style={styles.grid}>
        {genres.map((genre) => {
          const isChecked = selectedGenres.includes(genre.id);

          return (
            <label
              key={genre.id}
              style={{
                ...styles.genreCard,
                ...(isChecked ? styles.genreCardActive : {}),
              }}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleGenre(genre.id)}
                style={styles.checkboxHidden}
              />

              <div style={styles.cardInner}>
                <span style={styles.genreName}>{genre.name}</span>

                <span
                  style={{
                    ...styles.badge,
                    ...(isChecked ? styles.badgeOn : styles.badgeOff),
                  }}
                >
                  {isChecked ? "Odabrano" : "Dodaj"}
                </span>
              </div>

              <div
                style={{
                  ...styles.glow,
                  opacity: isChecked ? 1 : 0,
                }}
              />
            </label>
          );
        })}
      </div>
    </div>
  </div>
);

}


const styles = {
  page: {
    minHeight: "100vh",
    padding: "48px 18px",
    color: "white",
    background:
      "radial-gradient(1000px 600px at 15% 10%, rgba(140,255,213,0.12), transparent 60%), radial-gradient(900px 600px at 80% 20%, rgba(140,190,255,0.12), transparent 55%), linear-gradient(180deg, #0b1416 0%, #0e1b1d 55%, #0b1416 100%)",
    display: "flex",
    justifyContent: "center",
  },

  shell: {
    width: "100%",
    maxWidth: "980px",
    borderRadius: "26px",
    padding: "22px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
    backdropFilter: "blur(10px)",
  },

  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "18px",
    padding: "10px 10px 16px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    marginBottom: "18px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 800,
    letterSpacing: "0.2px",
    lineHeight: 1.1,
    background:
      "linear-gradient(90deg, rgba(220,255,245,1) 0%, rgba(190,230,255,1) 40%, rgba(255,220,245,1) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  caption: {
    margin: "10px 0 0 0",
    fontSize: "14px",
    opacity: 0.85,
    color: "rgba(245,255,255,0.9)",
  },

  countPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "28px",
    height: "22px",
    padding: "0 10px",
    borderRadius: "999px",
    marginLeft: "6px",
    fontWeight: 800,
    fontSize: "12px",
    color: "#071213",
    background:
      "linear-gradient(90deg, rgba(140,255,213,1), rgba(140,190,255,1))",
    boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginTop: "10px",
    width: "100%",
  },

  genreCard: {
    position: "relative",
    borderRadius: "18px",
    padding: "16px 16px",
    cursor: "pointer",
    userSelect: "none",
    overflow: "hidden",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
    transform: "translateY(0px) scale(1)",
    transition:
      "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease",
  },

  genreCardActive: {
    border: "1px solid rgba(140,255,213,0.55)",
    boxShadow:
      "0 22px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(140,255,213,0.25) inset",
    background:
      "linear-gradient(180deg, rgba(140,255,213,0.18), rgba(255,255,255,0.04))",
    transform: "translateY(-2px) scale(1.01)",
  },

  cardInner: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
  },

  genreName: {
    fontSize: "15px",
    fontWeight: 800,
    letterSpacing: "0.4px",
    color: "rgba(245,255,255,0.95)",
    textTransform: "capitalize",
  },

  badge: {
    fontSize: "12px",
    fontWeight: 800,
    padding: "8px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.14)",
    transition: "transform 180ms ease, opacity 180ms ease",
    transform: "translateY(0px)",
    whiteSpace: "nowrap",
  },

  badgeOn: {
    color: "#061212",
    background:
      "linear-gradient(90deg, rgba(140,255,213,1), rgba(140,190,255,1))",
    boxShadow: "0 12px 26px rgba(0,0,0,0.35)",
  },

  badgeOff: {
    color: "rgba(255,255,255,0.88)",
    background: "rgba(255,255,255,0.06)",
  },

  glow: {
    position: "absolute",
    inset: "-40px -40px auto -40px",
    height: "160px",
    background:
      "radial-gradient(closest-side, rgba(140,255,213,0.38), transparent 70%)",
    filter: "blur(8px)",
    transition: "opacity 180ms ease",
    zIndex: 1,
    pointerEvents: "none",
  },

  checkboxHidden: {
    position: "absolute",
    opacity: 0,
    pointerEvents: "none",
  },

  saveButton: {
    border: "none",
    borderRadius: "16px",
    padding: "12px 16px",
    fontWeight: 900,
    letterSpacing: "0.4px",
    color: "#061212",
    cursor: "pointer",
    background:
      "linear-gradient(90deg, rgba(140,255,213,1), rgba(140,190,255,1), rgba(255,220,245,1))",
    boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
    transform: "translateY(0px)",
    transition: "transform 140ms ease, box-shadow 140ms ease, filter 140ms ease",
  },
};
