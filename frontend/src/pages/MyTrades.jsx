import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import apiAuth from '../services/apiAuth.js';
import "./../styles/homepage.css";
import { useNavigate } from 'react-router';

export function MyTrades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

  useEffect(function() {
    async function fetchTrades() {
      try {
        setLoading(true);
        
        const profileRes = await apiAuth.get('profile/');
        setCurrentUser(profileRes.data);
        
        const res = await apiAuth.get('swaps/');

        const historical = res.data.filter(function(o) {
          return o.status !== "PENDING";
        });

        setTrades(historical);
        setError(null);
      } catch (err) {
        console.error("Error fetching trade history:", err);
        setError("Could not fetch trade history.");
      } finally {
        setLoading(false);
      }
    }

    fetchTrades();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Trade History</h2>
        <Button className="home_button" onClick={() => {navigate('/')}}>Back to Home</Button>
      </div>

      {trades.length === 0 ? (
        <div className="alert alert-info">You have no completed or rejected trades.</div>
      ) : (
        <ul className="list-group">
          {trades.map(function(offer) {
            const proposer = offer.proposer && offer.proposer.email ? offer.proposer.email : "—";
            const target = offer.target && offer.target.email ? offer.target.email : "—";
            
            const isCurrentUserProposer = currentUser && offer.proposer && currentUser.id === offer.proposer.id;

            let statusBadgeClass = "bg-secondary";
            if (offer.status === "ACCEPTED") statusBadgeClass = "bg-success";
            if (offer.status === "REJECTED") statusBadgeClass = "bg-danger";
            if (offer.status === "CANCELLED") statusBadgeClass = "bg-dark";

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
                  <span className={"badge " + statusBadgeClass}>{offer.status}</span>
                  <div className="mt-2">
                    <Link className="btn btn-sm btn-outline-primary" to={'/offers/' + offer.id}>Details</Link>
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