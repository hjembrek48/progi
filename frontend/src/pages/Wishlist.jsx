import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Form, ListGroup, Card } from 'react-bootstrap';
import apiAuth from '../services/apiAuth.js';
import Loading from '../components/Loading';
import { FaTrash, FaPlusCircle } from 'react-icons/fa';
import '../styles/homepage.css';
import { useNavigate } from 'react-router';

export function Wishlist() {
  const [wishlistEntries, setWishlistEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bgName, setBgName] = useState('');
  const [gamesFromBGG, setGamesFromBGG] = useState([]);
  const [selectedBoardGame, setSelectedBoardGame] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await apiAuth.get('wishlist/');
      setWishlistEntries(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!bgName || bgName.length < 2 || selectedBoardGame) {
      setGamesFromBGG([]);
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await apiAuth.get('boardgames/autocomplete/', {
          params: { query: bgName },
        });
        setGamesFromBGG(res.data);
      } catch (err) {
        console.error('Search error:', err);
        setGamesFromBGG([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [bgName, selectedBoardGame]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setBgName(value);
    setSelectedBoardGame(null);
    if (!value) {
      setGamesFromBGG([]);
    }
  };

  const handleSelectGame = (game) => {
    setBgName(game.name);
    setSelectedBoardGame(game);
    setGamesFromBGG([]);
  };

  const handleAddWishlistEntry = async () => {
    if (!selectedBoardGame) {
      setError('Please select a game from the list');
      return;
    }

    setIsAdding(true);
    try {
      await apiAuth.post('wishlist/', { board_game_id: selectedBoardGame.id });
      setBgName('');
      setSelectedBoardGame(null);
      setGamesFromBGG([]);
      setError(null);
      await fetchWishlist();
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      const errorMsg = err.response?.data?.non_field_errors?.[0]
        || err.response?.data?.board_game_id?.[0]
        || err.response?.data?.detail
        || 'Failed to add to wishlist';
      setError(errorMsg);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteWishlistEntry = async (id) => {
    if (!window.confirm('Remove from wishlist?')) return;

    try {
      await apiAuth.delete(`wishlist/${id}/`);
      await fetchWishlist();
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      setError('Failed to remove item');
    }
  };

  if (loading) {
    return <Loading size="lg" fullPage />;
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4 text-dark">
          <h2 className="fw-bold">My Wishlist</h2>
          <Button className="home_button" onClick={() => {navigate('/')}}>Back to Home</Button>
      </div>
    
      <div className="bg-light border rounded-4 shadow-sm p-4 p-md-5">
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        <Row className="g-4 mb-5">
          <Col lg={6}>
            <Card className="border-0 shadow-sm" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
              <Card.Header className="bg-primary bg-opacity-10 border-bottom">
                <h5 className="mb-0 fw-bold text-primary">Add Game to Wishlist</h5>
              </Card.Header>
              <Card.Body style={{ overflowY: 'auto', flex: 1 }}>
                <div style={{ position: 'relative' }}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Game Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search game from BGG database..."
                      value={bgName}
                      onChange={handleNameChange}
                      className="mb-2"
                    />
                    {gamesFromBGG.length > 0 && (
                      <ListGroup style={{ maxHeight: '300px', overflowY: 'auto', position: 'absolute', width: '100%', zIndex: 1000, top: '100%', left: 0, marginTop: '-5px' }}>
                      {gamesFromBGG.map((game) => (
                        <ListGroup.Item
                          key={game.id}
                          as="button"
                          action
                          onClick={() => handleSelectGame(game)}
                          className="text-start"
                        >
                          {game.name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                    {selectedBoardGame && (
                      <div className="alert alert-info mb-3">
                        <small>Selected: <strong>{selectedBoardGame.name}</strong></small>
                      </div>
                    )}
                  </Form.Group>
                </div>

                <Button
                  className="home_button w-100"
                  onClick={handleAddWishlistEntry}
                  disabled={isAdding || !selectedBoardGame}
                >
                  <FaPlusCircle className="me-2" />
                  {isAdding ? 'Adding...' : 'Add to Wishlist'}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="border-0 shadow-sm" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
              <Card.Header className="bg-success bg-opacity-10 border-bottom">
                <h5 className="mb-0 fw-bold text-success">
                  Wishlist Items ({wishlistEntries.length})
                </h5>
              </Card.Header>
              <Card.Body style={{ overflowY: 'auto', flex: 1 }}>
                {wishlistEntries.length === 0 ? (
                  <p className="text-muted fst-italic">No items in wishlist yet</p>
                ) : (
                  <ListGroup variant="flush">
                    {wishlistEntries.map((entry) => (
                      <ListGroup.Item
                        key={entry.id}
                        className="d-flex justify-content-between align-items-center py-3"
                      >
                        <div>
                          <div className="fw-semibold">{entry.display_name}</div>
                          <small className="text-muted">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </small>
                        </div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteWishlistEntry(entry.id)}
                          className="ms-2"
                        >
                          <FaTrash />
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
}
