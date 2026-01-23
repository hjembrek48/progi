import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import apiAuth from '../services/apiAuth.js';
import "./../styles/homepage.css";
import { useNavigate } from 'react-router';
import Loading from '../components/Loading';

export function OffersList() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(function() {
    async function fetchOffers() {
      try {
        setLoading(true);

        const profileRes = await apiAuth.get('profile/');
        setCurrentUser(profileRes.data);

        // dohvat ponuda koje su statusa PENDING
        const res = await apiAuth.get('swaps/?status=PENDING');

        setOffers(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load trade offers:", err);
        setError("Failed to load trade offers.");
      } finally {
        setLoading(false);
      }
    }

    fetchOffers();
  }, []);

  async function handleDelete(offerId) {
    if (!window.confirm("Are you sure you want to delete this offer? This action cannot be undone.")) return;
    try {
      setDeletingId(offerId);
      await apiAuth.delete('swaps/' + offerId + '/');
      setOffers(function(prev) {
        return prev.filter(function(o) { return o.id !== offerId; });
      });
    } catch (err) {
      console.error("Failed to delete trade offer:", err);
      setError("Failed to delete trade offer.");
    } finally {
      setDeletingId(null);
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

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 text-dark">
        <h2 className="fw-bold">My Pending Offers</h2>
        <Button className="home_button" onClick={() => {navigate('/')}}>Back to Home</Button>
      </div>
      
      {offers.length === 0 ? (
        <div className="alert alert-info">No offers found</div>
      ) : (
        <ul className="list-group">
          {offers.map(function(offer) {
            const proposer = (offer.proposer && offer.proposer.username) ? offer.proposer.username : offer.proposer?.email.split("@")[0] || "—";
            const target = (offer.target && offer.target.username) ? offer.target.username : offer.target?.email.split("@")[0] || "—";
            
            const isCurrentUserProposer = currentUser && offer.proposer && currentUser.id === offer.proposer.id;

            return (
              <li key={offer.id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                <div>
                  <h5 className="mb-1" style={{ fontSize: '1.1rem' }}>
                    <Link to={'/offers/' + offer.id} className="text-decoration-none">
                      {isCurrentUserProposer ? <strong>Me</strong> : proposer} 
                      <span className="text-muted mx-2">→</span> 
                      {(!isCurrentUserProposer && currentUser?.id === offer.target?.id) ? <strong>Me</strong> : target}
                    </Link>
                  </h5>
                  
                  <small className="text-muted">{new Date(offer.updated_at || offer.created_at).toLocaleString()}</small>
                  <div>
                    {isCurrentUserProposer ? (
                      <span className="badge bg-primary">Sent Offer</span>
                    ) : (
                      <span className="badge bg-info text-dark">Received Offer</span>
                    )}
                    <span className="badge bg-light text-dark border ms-2">
                      {offer.offered_games?.length} Offered • {offer.requested_games?.length} Requested
                    </span>
                  </div>
                </div>

                <div className="text-end">
                  <span className="badge bg-warning text-dark shadow-sm">PENDING</span>
                  <div className="mt-3 d-flex gap-2 justify-content-end">
                    <Link className="btn btn-sm btn-outline-primary px-3" to={'/offers/' + offer.id}>Details</Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}