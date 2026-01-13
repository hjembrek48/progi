import { useEffect, useState } from "react";
import apiAuth from "../services/apiAuth";
import { useParams } from "react-router";
import { Button, Container, Spinner } from "react-bootstrap";
import "../styles/SearchPage.css";
import SmartHomepageHeader from "../components/SmartHomepageHeader";
import ReactStars from "react-rating-stars-component";
import { FaStar } from "react-icons/fa";

function ListingPage() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  useEffect(() => {
    const getListingData = async () => {
      try {
        const res = await apiAuth.get(
          `${process.env.REACT_APP_API_URL}/api/listings/${params.listingId}`
        );
        setListing(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Ne mogu dohvatiti podatke o igri.");
      }
    };
    getListingData();
  }, []);
  return (
    <Container>
      <SmartHomepageHeader />
      {listing == null ? (
        <div className="info_container dark_text">
          <Spinner style={{ width: "6rem", height: "6rem" }}></Spinner>
        </div>
      ) : (
        <div className="dark_green_bg">
          <div className="p-3">
            <h1>{listing.game.name}</h1>
            Owned by: {listing.profile.email.split("@")[0]}
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
            <Button className="home_button m-2">Request trade</Button>
          </div>
        </div>
      )}
    </Container>
  );
}

export default ListingPage;
