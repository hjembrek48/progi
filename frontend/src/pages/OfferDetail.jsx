import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiAuth from '../services/apiAuth.js';
import { GameCardBigger } from '../components/GameCardBigger';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge
} from 'react-bootstrap';
import Loading from '../components/Loading';

export function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [offer, setOffer] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(function() {
    async function fetchData() {
      try {
        setLoading(true);
        const profileRes = await apiAuth.get('profile/');
        setCurrentUser(profileRes.data);

        const res = await apiAuth.get('swaps/' + id + '/');
        setOffer(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load trade offer:", err);
        setError("Failed to load offer data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  function renderGamesList(games) {
    if (!games || games.length === 0) {
      return <div className="p-3 text-muted fst-italic">No games selected</div>;
    }

    return (
      <div className="d-flex flex-wrap gap-3 p-3">
        {games.map(function(g) {
          return (
            <Card
              key={g.id}
              className="border-0 shadow-sm"
              style={{ width: "120px", flex: "0 0 auto", overflow: "hidden", cursor: "pointer" }}
              onClick={() => setSelectedGame(g)}
            >
              {g.photo ? (
                <Card.Img 
                  variant="top" 
                  src={g.photo} 
                  style={{ height: "85px", objectFit: "cover" }} 
                />
              ) : (
                <div className="bg-light d-flex align-items-center justify-content-center text-muted small" style={{ height: "85px" }}>
                  No Image
                </div>
              )}
              <Card.Body className="p-2">
                <Card.Text 
                  className="small fw-bold text-truncate mb-0" 
                  title={g.name}
                  style={{ fontSize: "0.75rem" }}
                >
                  {g.name}
                </Card.Text>
              </Card.Body>
            </Card>
          );
        })}
      </div>
    );
  }

  async function handleAccept() {
    if (!window.confirm("Accept this offer?")) return;
    try {
      setActionLoading(true);
      await apiAuth.post('swaps/' + id + '/accept/');
      navigate('/mytrades');
    } catch (err) {
      console.error("Accept failed", err);
      setError("Failed to accept offer.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!window.confirm("Reject this offer?")) return;
    try {
      setActionLoading(true);
      await apiAuth.post('swaps/' + id + '/reject/');
      navigate('/mytrades');
    } catch (err) {
      console.error("Reject failed", err);
      setError("Failed to reject offer.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this offer? This action cannot be undone.")) return;
    try {
      setActionLoading(true);
      await apiAuth.delete('swaps/' + id + '/');
      navigate('/offers');
    } catch (err) {
      console.error("Delete failed", err);
      setError("Failed to delete offer.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <Loading size="lg" fullPage />;

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );
  }

  if (!offer) {
    return null;
  }

  const isCurrentUserProposer = currentUser && offer.proposer && currentUser.id === offer.proposer.id;
  const isCurrentUserTarget = currentUser && offer.target && currentUser.id === offer.target.id;
  
  const proposerName = isCurrentUserProposer ? "Me" : (offer.proposer && offer.proposer.username ? offer.proposer.username : offer.proposer?.email.split("@")[0] || "—");
  const targetName = isCurrentUserTarget ? "Me" : (offer.target && offer.target.username ? offer.target.username : offer.target?.email.split("@")[0] || "—");

  return (
    <Container fluid className="py-5">
      <Container>
        <h2 className="mb-4 fw-bold text-dark">Offer Details</h2>
      </Container>

      <Container className="py-3">
        <div className="bg-light border rounded-4 shadow-sm p-4 p-md-5">
          <Row className="mb-5 align-items-center">
            <Col>
              <h1 className="h3 fw-bold mb-1 text-dark">
                {proposerName} 
                <span className="text-primary mx-3">→</span> 
                {targetName}
              </h1>
              <div className="text-muted small">
                {new Date(offer.updated_at || offer.created_at).toLocaleString()}
              </div>
            </Col>
            <Col xs="auto">
              <Badge pill bg="white" className="text-dark border p-2 px-3 shadow-sm">
                <span className="me-2 text-warning">●</span> {offer.status}
              </Badge>
            </Col>
          </Row>

          <Row className="g-4">
            <Col lg={6}>
              <div className="bg-white rounded-4 shadow-sm h-100 overflow-hidden">
                <div className="bg-primary bg-opacity-10 p-3 border-bottom">
                  <h6 className="mb-0 fw-bold text-primary text-uppercase small">Offered Games</h6>
                </div>
                <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                  {renderGamesList(offer.offered_games)}
                </div>
              </div>
            </Col>

            <Col lg={6}>
              <div className="bg-white rounded-4 shadow-sm h-100 overflow-hidden">
                <div className="bg-success bg-opacity-10 p-3 border-bottom">
                  <h6 className="mb-0 fw-bold text-success text-uppercase small">Requested Games</h6>
                </div>
                <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                  {renderGamesList(offer.requested_games)}
                </div>
              </div>
            </Col>
          </Row>

          <div className="mt-5 pt-4 border-top d-flex flex-wrap align-items-center gap-3">
            {isCurrentUserTarget && offer.status === "PENDING" && (
              <>
                <Button variant="success" size="lg" className="px-5 shadow-sm" onClick={handleAccept} disabled={actionLoading}>
                  Accept Trade
                </Button>
                <Button variant="outline-danger" size="lg" className="px-4" onClick={handleReject} disabled={actionLoading}>
                  Decline
                </Button>
              </>
            )}

            {offer.status === "PENDING" && (
              <Button as={Link} to={`/offers/${offer.id}/edit`} variant="primary" size="lg" className="px-5">
                Edit Offer
              </Button>
            )}

            {isCurrentUserProposer && offer.status === "PENDING" && (
              <Button variant="danger" size="lg" className="px-5" onClick={handleDelete} disabled={actionLoading}>
                Delete Offer
              </Button>
            )}
            
            <Button as={Link} to="/offers" variant="link" className="ms-md-auto text-decoration-none text-muted fw-semibold">
              ← Back to all offers
            </Button>
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
      </Container>
    </Container>
  );
}