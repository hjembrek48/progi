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

      alert("Spremljeno!");
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
              Odabrano:
              <span style={styles.countPill}>
                {selectedGenres.length}
              </span>
            </p>
          </div>

          <button
            style={styles.saveButton}
            onClick={saveWishlist}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.97)")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            Spremi
          </button>
        </div>

        <div style={styles.grid}>
          {genres.map((genre) => {
            const isSelected = selectedGenres.includes(genre.id);

            return (
              <label
                key={genre.id}
                style={{
                  ...styles.genreCard,
                  ...(isSelected ? styles.genreCardActive : {}),
                }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.98)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
               
                <div style={styles.genreContent}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleGenre(genre.id)}
                    style={styles.checkbox}
                  />

                  <span style={styles.genreName}>
                    {genre.name}
                  </span>
                </div>
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
      "linear-gradient(180deg, #0b1416 0%, #0e1b1d 55%, #0b1416 100%)",
    display: "flex",
    justifyContent: "center",
  },

  shell: {
    width: "100%",
    maxWidth: "980px",
    borderRadius: "26px",
    padding: "22px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 800,
  },

  caption: {
    marginTop: "6px",
    fontSize: "14px",
    opacity: 0.85,
  },

  countPill: {
    marginLeft: "8px",
    padding: "2px 10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    fontSize: "12px",
    fontWeight: 700,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  genreCard: {
    borderRadius: "16px",
    padding: "20px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    cursor: "pointer",
    transition: "transform 0.15s ease",
  },

  genreCardActive: {
    background: "rgba(255,255,255,0.14)",
  },

  
  genreContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    textAlign: "center",
  },

  genreName: {
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "0.4px",
  },

  checkbox: {
    transform: "scale(1.2)",
    accentColor: "#cad2c5",
    cursor: "pointer",
  },

  saveButton: {
    padding: "12px 18px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.15s ease",
  },
};
