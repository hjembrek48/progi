import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiAuth from '../services/apiAuth.js';
import { GameCardBigger } from '../components/GameCardBigger';
import { Container, Spinner } from 'react-bootstrap';

export function GameExchange() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const listingId = searchParams.get('listingId');

  // stanja
  const [targetGame, setTargetGame] = useState(null);
  const [targetUserGames, setTargetUserGames] = useState([]);
  const [myGames, setMyGames] = useState([]);
  const [selectedOfferedGameIds, setSelectedOfferedGameIds] = useState([]);
  const [selectedWantedGameIds, setSelectedWantedGameIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(function() {
    async function fetchData() {
      try {
        setLoading(true);
        
        if (!listingId) {
          setError("No listing selected (missing listing ID).");
          setLoading(false);
          return;
        }

        // dohvacenje podataka o objavi - listingu
        const listingRes = await apiAuth.get(`listings/${listingId}/`);
        const listingData = listingRes.data;

        setTargetGame(listingData.game);
        
        // dohvacanje profilId iz objave - listing
        const targetProfileId = listingData.profile?.id;

        if (!targetProfileId) {
          setError("Error: Profile ID not found in listing!", listingData);
          setLoading(false);
          return;
        }

        // dohvacanje svih objava
        const targetListingsRes = await apiAuth.get(`listings/`);

        if (!targetListingsRes.data || !Array.isArray(targetListingsRes.data)) {
          setError("The API did not return a list of listings.");
          setLoading(false);
          return;
        }

        // dohvat podataka iz objave, filtriranje po profilId, mapiranje na igre
        const gamesFromListings = targetListingsRes.data
          .filter(listing => listing.profile?.id === targetProfileId)
          .map(listing => listing.game);
        setTargetUserGames(gamesFromListings);
        
        // checkanje igre na koju smo zatrazili zamjenu
        setSelectedWantedGameIds([parseInt(listingData.game.id)]);

        // dohavacanje mojih igri
        const myGamesRes = await apiAuth.get('games/');
        //setMyGames(myGamesRes.data.filter(g => g.active));
        setMyGames(myGamesRes.data);

        setError(null);
      } catch (err) {
        console.error("Detailed error:", err);
        setError("Could not fetch data for game exchange.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [listingId]);

  // checkboxovi za moje igre (koje nudim)
  function handleOfferedGameToggle(id) {
    setSelectedOfferedGameIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }

  // checkboxovi za tuđe igre (koje želim)
  function handleWantedGameToggle(id) {
    setSelectedWantedGameIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }

  // slanje ponude za zamjenu
  async function handleSendOffer() {
    if (selectedOfferedGameIds.length === 0) {
      alert("Please select at least one of your games to offer in the trade!");
      return;
    }

    if (selectedWantedGameIds.length === 0) {
      alert("Please select at least one game you want from the user!");
      return;
    }

    const targetProfileId = targetGame?.profile?.id;
    
    if (!targetProfileId) {
      alert("Error: Profile owner not found.");
      return;
    }

    try {
      setSubmitting(true);

      const offerData = {
        target_id: targetProfileId,
        offered_game_ids: selectedOfferedGameIds,
        requested_game_ids: selectedWantedGameIds,
      };

      await apiAuth.post('swaps/', offerData);
      
      alert("Offer sent successfully!");
      navigate('/offers');
    } catch (err) {
      console.error("Error sending offer:", err);
      alert("An error occurred while sending the offer.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <div className="mt-3 text-muted">Loading...</div>
      </Container>
    );
  }


  if (error) return (
    <div className="container py-5 text-center">
      <div className="alert alert-danger">{error}</div>
      <button className="btn btn-primary" onClick={() => navigate('/')}>Go on Home page</button>
    </div>
  );

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">New trade offer</h2>
      <div className="row">
        
        {/* LIJEVO: Tuđe igre */}
        <div className="col-md-6 mb-4">
          <div className="card border-primary shadow-sm">
            <div className="card-header bg-primary text-white font-weight-bold">
              Requested games
            </div>
            <ul className="list-group list-group-flush" style={{maxHeight: "450px", overflowY: "auto"}}>
              {targetUserGames.map(game => (
                <li key={game.id} className="list-group-item d-flex align-items-center gap-3">
                  <input 
                    type="checkbox" 
                    className="form-check-input"
                    checked={selectedWantedGameIds.includes(game.id)}
                    onChange={() => handleWantedGameToggle(game.id)}
                  />
                  {game.photo && <img src={game.photo} alt="" style={{width: "50px", height: "50px", objectFit: "cover", cursor: "pointer"}} onClick={() => setSelectedGame(game)} />}
                  <div style={{cursor: "pointer"}} onClick={() => setSelectedGame(game)}>
                    <div className="font-weight-bold">{game.name}</div>
                    <small className="text-muted">Preservation rating: {game.grade}/5</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* DESNO: Moje igre */}
        <div className="col-md-6">
          <div className="card border-dark shadow-sm">
            <div className="card-header bg-dark text-white font-weight-bold">
              Offered games
            </div>

            {myGames.length === 0 ? (
              <div className="card-body text-center py-5">
                <p className="text-muted mb-3">You don't have any games to offer.</p>
                <button 
                  className="btn btn-outline-dark btn-sm" 
                  onClick={() => navigate('/my_games')}
                >
                  Add a game to your collection
                </button>
              </div>
            ) : (
              <>
                <ul className="list-group list-group-flush" style={{maxHeight: "450px", overflowY: "auto"}}>
                  {myGames.map(game => (
                    <li key={game.id} className="list-group-item d-flex align-items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="form-check-input"
                        checked={selectedOfferedGameIds.includes(game.id)}
                        onChange={() => handleOfferedGameToggle(game.id)}
                      />
                      {game.photo && <img src={game.photo} alt="" style={{width: "50px", height: "50px", objectFit: "cover", cursor: "pointer"}} onClick={() => setSelectedGame(game)} />}
                      <div style={{cursor: "pointer"}} onClick={() => setSelectedGame(game)}>
                        <div className="font-weight-bold">{game.name}</div>
                        <small className="text-muted">Preservation rating: {game.grade}/5</small>
                      </div>
                    </li>
                  ))}
                </ul>
              
                <div className="card-footer">
                  <button 
                    className="btn btn-success w-100 btn-lg" 
                    onClick={handleSendOffer}
                    disabled={submitting}
                  >
                    {submitting ? "Sending..." : "Send offer"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {selectedGame && 
        <GameCardBigger 
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          listings={[]}
          readOnly={true}
        />
      }
    </div>
  );
}