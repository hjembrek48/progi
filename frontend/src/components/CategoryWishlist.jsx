import { useEffect, useState } from "react";
import apiAuth from "../services/apiAuth";

export function CategoryWishlist() {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const MAX_GENRES = 6;

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await apiAuth.get("genres/");
        setGenres(res.data);
      } catch (err) {
        console.error("Greška kod dohvaćanja žanrova", err);
      }
    };

    fetchGenres();
  }, []);

  const toggleGenre = (genreId) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreId)) {
        return prev.filter((id) => id !== genreId);
      }

      if (prev.length >= MAX_GENRES) {
        return prev;
      }

      return [...prev, genreId];
    });
  };

  const saveWishlist = async () => {
    try {
      await apiAuth.put("profile/genre-wishlist/", {
        genres: selectedGenres,
      });
      alert("Spremljeno!");
    } catch (err) {
      console.error("Greška kod spremanja", err);
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>
        Odaberi omiljene žanrove{" "}
        <span style={styles.subtitle}>
          ({selectedGenres.length}/{MAX_GENRES})
        </span>
      </h2>

      <div style={styles.gridWrapper}>
        <div style={styles.grid}>
          {genres.map((genre) => {
            const isChecked = selectedGenres.includes(genre.id);
            const isDisabled =
              !isChecked && selectedGenres.length >= MAX_GENRES;

            return (
              <label
                key={genre.id}
                style={{
                  ...styles.genreItem,
                  ...(isDisabled ? styles.genreItemDisabled : {}),
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => toggleGenre(genre.id)}
                  style={styles.checkbox}
                />
                <span style={styles.genreText}>{genre.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      <button
        style={{
          ...styles.saveButton,
          ...(selectedGenres.length === 0 ? styles.saveButtonDisabled : {}),
        }}
        onClick={saveWishlist}
        disabled={selectedGenres.length === 0}
      >
        Spremi
      </button>
    </div>
  );
}

const styles = {
  page: {
    padding: "40px",
    color: "white",
  },

  title: {
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "0.6px",
    marginBottom: "12px",
  },

  subtitle: {
    fontSize: "14px",
    fontWeight: 500,
    opacity: 0.75,
  },

  gridWrapper: {
    display: "flex",
    justifyContent: "center",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginTop: "24px",
    maxWidth: "900px",
    width: "100%",
  },

  genreItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "16px",
    background: "linear-gradient(145deg, #3f5f5a, #2b4446)",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 6px 14px rgba(0, 0, 0, 0.35)",
  },


  genreItemDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  genreText: {
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "0.4px",
    textTransform: "capitalize",
    color: "#f1faee",
  },

  checkbox: {
    transform: "scale(1.2)",
    accentColor: "#cad2c5",
  },

  saveButton: {
    marginTop: "36px",
    padding: "14px 28px",
    border: "none",
    borderRadius: "18px",
    background: "linear-gradient(145deg, #2c3f44, #1f2d33)",
    color: "white",
    fontWeight: 700,
    letterSpacing: "0.6px",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
    transition: "transform 0.15s ease",
  },

  saveButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};
