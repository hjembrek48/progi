import { useEffect, useState } from "react";
import apiAuth from "../services/apiAuth";
import { Link, useParams } from "react-router";
import { Button, Container } from "react-bootstrap";
import "../styles/SearchPage.css";
import SmartHomepageHeader from "../components/SmartHomepageHeader";
import ReactStars from "react-rating-stars-component";
import { FaStar } from "react-icons/fa";
import Loading from "../components/Loading";

function ListingPage() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const params = useParams();
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [listingRes, profileRes] = await Promise.all([
          apiAuth.get(
            `${process.env.REACT_APP_API_URL}/api/listings/${params.listingId}`
          ),
          apiAuth.get('profile/')
        ]);
        setListing(listingRes.data);
        setCurrentUser(profileRes.data);
      } catch (error) {
        console.error("Ne mogu dohvatiti podatke o igri.", error);
        setError(error.response?.status === 404 ? "Listing not found." : "Failed to load listing data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.listingId]);
  return (
    <Container>
      <SmartHomepageHeader />
      {loading ? (
        <Loading size="lg" fullPage={false} className="info_container dark_text" />
      ) : error ? (
        <div className="alert alert-danger m-5 text-center">
          <h4>{error}</h4>
          <Link to="/" className="btn btn-primary mt-3">Go to Homepage</Link>
        </div>
      ) : (
        <div className="dark_green_bg">
          <div className="p-3">
            <h1>{listing.game.name}</h1>
            Owned by: {currentUser && currentUser.id === listing.profile.id
              ? 'Me'
              : listing.profile.email.split("@")[0]}
            {listing.description ? (
              <p className="fs-5">Description: {listing.description}</p>
            ) : (
              <p></p>
            )}
            <img
              src={listing.game.photo}
              style={{
                maxHeight: "400px",
                maxWidth: "100%",
                minHeight: "200px",
                minWidth: "200px",
              }}
            ></img>
          </div>
          <div className="border_break"></div>
          <div className="p-3">
            <h3>Game details:</h3>
            <p>
              Genre: {listing.game.genre.name}
              <br />
              Player count: {listing.game.min_players}-
              {listing.game.max_players}
              <br />
              <div className="d-flex gap-1 align-items-center">
                Preservation rate:{" "}
                <ReactStars
                  count={5}
                  emptyIcon={<FaStar />}
                  filledIcon={<FaStar />}
                  value={listing.game.grade}
                  activeColor="#ffd700"
                  classNames="mb-1"
                />
              </div>
              Playing time: {listing.game.playing_time}h
              <br />
              Complexity: {listing.game.complexity}
              <br />
              Publisher: {listing.game.publisher}
            </p>
            {currentUser && currentUser.id !== listing.profile.id && (
              <Link to={`/gameexchange?listingId=${listing.id}`}>
                <Button className="home_button m-2">Request trade</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </Container>
  );
}

export default ListingPage;
