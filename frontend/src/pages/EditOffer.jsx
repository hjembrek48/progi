import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiAuth from '../services/apiAuth.js';
import { Container, Row, Col, Button, Spinner, Alert, Stack } from 'react-bootstrap';

export function EditOffer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [offer, setOffer] = useState(null);
  const [targetGames, setTargetGames] = useState([]);
  const [myGames, setMyGames] = useState([]);
  const [selectedOfferedGames, setSelectedOfferedGames] = useState([]);
  const [selectedRequestedGames, setSelectedRequestedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(function() {
    async function fetchData() {
      try {
        setLoading(true);

        const offerRes = await apiAuth.get('swaps/' + id + '/');
        const offerData = offerRes.data;
        setOffer(offerRes.data);

        const profileRes = await apiAuth.get('profile/');
        const me = profileRes.data;
        setCurrentUser(me);

        const myGamesRes = await apiAuth.get('games/');
        setMyGames(myGamesRes.data);
        
        const isCurrentUserProposer = me?.id === offerData?.proposer?.id;
        const counterpartId = isCurrentUserProposer ? offerData.target.id : offerData.proposer.id;

        const listingsRes = await apiAuth.get('listings/');
        const counterpartGamesFromListings = listingsRes.data
          .filter((listing) => (listing.profile?.id) === counterpartId)
          .map((listing) => listing.game);

        setTargetGames(counterpartGamesFromListings);

        const offeredIds = (offerData.offered_games || []).map(g => g.id);
        const requestedIds = (offerData.requested_games || []).map(g => g.id);

        if (isCurrentUserProposer) {
          setSelectedOfferedGames(offeredIds);
          setSelectedRequestedGames(requestedIds);
        } else {
          // ako current user nije proposer, obrni preselectane igre
          setSelectedOfferedGames(requestedIds);
          setSelectedRequestedGames(offeredIds);
        }
        
        setError(null);
      } catch (err) {
        console.error("Greška pri dohvaćanju ponude:", err);
        setError("Ne mogu dohvatiti podatke ponude.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  function handleOfferedGameToggle(gameId) {
    setSelectedOfferedGames(function(prev) {
      const isInList = prev.includes(gameId);
      if (isInList) {
        return prev.filter(function(gid) { return gid !== gameId; });
      } else {
        return [...prev, gameId];
      }
    });
  }

  function handleWantedGameToggle(gameId) {
    setSelectedRequestedGames(function(prev) {
      const isInList = prev.includes(gameId);
      if (isInList) {
        return prev.filter(function(gid) { return gid !== gameId; });
      } else {
        return [...prev, gameId];
      }
    });
  }

  async function handleUpdateOffer() {
    if (selectedOfferedGames.length === 0 || selectedRequestedGames.length === 0) {
      setError("You must select at least one game to offer and one to request.");
      return;
    }

    try {
      setSubmitting(true);
      
      const isCurrentUserProposer = currentUser && offer?.proposer && currentUser.id === offer.proposer.id;
      const payload = isCurrentUserProposer
        ? {
            offered_game_ids: selectedOfferedGames,
            requested_game_ids: selectedRequestedGames
          }
        : {
            proposer_id: offer.target.id,
            target_id: offer.proposer.id,
            offered_game_ids: selectedRequestedGames,
            requested_game_ids: selectedOfferedGames
          };
      
      await apiAuth.patch('swaps/' + id + '/', payload);
      navigate('/offers/' + id);
    } catch (err) {
      console.error("Update failed", err);
      setError("Failed to update the offer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function renderGameSelection(games, selectedIds, handleToggle, label) {
    return (
      <div className="bg-white rounded-4 shadow-sm h-100 overflow-hidden border">
        <div className="bg-light p-3 border-bottom">
          <h5 className="mb-0 fw-bold text-secondary small text-uppercase">{label}</h5>
        </div>
        <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: "400px" }}>
          {games.length === 0 ? (
            <div className="p-4 text-center text-muted italic">No games available.</div>
          ) : (
            games.map((game) => {
              const isSelected = selectedIds.includes(game.id);
              return (
                <label 
                  key={game.id} 
                  className={`list-group-item list-group-item-action d-flex align-items-center p-3 ${isSelected ? "bg-primary bg-opacity-10" : ""}`}
                  style={{ cursor: "pointer", transition: "0.2s" }}
                >
                  <input 
                    type="checkbox" 
                    className="form-check-input me-3"
                    checked={isSelected} 
                    onChange={() => handleToggle(game.id)}
                  />
                  {game.photo ? (
                    <img 
                      src={game.photo} 
                      alt={game.name} 
                      className="rounded shadow-sm me-3"
                      style={{ height: "50px", width: "50px", objectFit: "cover" }} 
                    />
                  ) : (
                    <div className="bg-light rounded me-3 d-flex align-items-center justify-content-center" style={{ height: "50px", width: "50px", fontSize: "10px" }}>
                      No Image
                    </div>
                  )}
                  <span className={`fw-medium ${isSelected ? "text-primary" : "text-dark"}`}>
                    {game.name}
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <div className="mt-3 text-muted">Loading offer details...</div>
      </Container>
    );
  }

  if (!offer) {
    return null;
  }

  const isCurrentUserProposer = currentUser && offer?.proposer && currentUser.id === offer.proposer.id;
  const counterpartName = isCurrentUserProposer
    ? (offer.target && offer.target.username ? offer.target.username : offer.target?.email.split("@")[0] || "—")
    : (offer.proposer && offer.proposer.username ? offer.proposer.username : offer.proposer?.email.split("@")[0] || "—");

  return (
    <Container className="py-5">
      <div className="bg-light rounded-4 p-4 p-md-5 border shadow-sm">
        
        {/* Header */}
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Edit Offer with {counterpartName}</h2>
          <p className="text-muted">Modify the games you want to swap. You must select at least one game from each side.</p>
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible className="shadow-sm">
            {error}
          </Alert>
        )}

        <Row className="g-4">
          <Col lg={6}>
            {renderGameSelection(
              myGames, 
              selectedOfferedGames, 
              handleOfferedGameToggle, 
              "Games you're offering"
            )}
          </Col>
          <Col lg={6}>
            {renderGameSelection(
              targetGames, 
              selectedRequestedGames, 
              handleWantedGameToggle, 
              `Games you want from ${counterpartName}`
            )}
          </Col>
        </Row>

        {/* Action Footer */}
        <Stack direction="horizontal" gap={3} className="mt-5 pt-4 border-top">
          <Button 
            variant="primary" 
            size="lg" 
            className="px-5 shadow"
            onClick={handleUpdateOffer} 
            disabled={submitting}
          >
            {submitting ? "Updating..." : "Update Offer"}
          </Button>
          <Button 
            variant="outline-secondary" 
            size="lg" 
            className="px-4 text-decoration-none"
            onClick={() => navigate('/offers/' + id)} 
            disabled={submitting}
          >
            Cancel
          </Button>
        </Stack>
      </div>
    </Container>
  );
}