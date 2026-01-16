import { Button, Modal, Container } from "react-bootstrap";
import ReactStars from "react-rating-stars-component";
import { FaStar } from "react-icons/fa";
import { VscPerson } from "react-icons/vsc";
import './../styles/homepage.css';
import { useState } from "react";
import { useEffect } from "react";
import apiAuth from "../services/apiAuth";

export function ListingCardBigger({ listing, onClose }) {
    const [genres, setGenres] = useState([]);
    const [currentListing, setCurrentListing] = useState(listing);

    useEffect(() => {
        setCurrentListing(listing);
    }, [listing]);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await apiAuth.get("genres/");
                setGenres(res.data);
            } catch (e) {
                console.log("Failed to fetch game categories!")
            }
        };
    
            fetchGenres();
        }, []) //odmah dohvati žanrove

    const currentGenre = genres.find((genre) => genre.id === currentListing.game.genre.id)?.name || "—";

    const maxPlayers = Number(currentListing.game.max_players) || 0;

    return(
        <Modal show centered size="lg" onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {currentListing.game.name}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="game_card_bigger_listed">
                <>
                    <img 
                    src={currentListing.game.photo || currentListing.game.board_game?.image_url}
                    alt={currentListing.game.board_game?.name}
                    className="img-fluid mb-3"
                    />
                        
                    <p>Genre: <br/> {currentGenre} </p>
                    <p>Publisher: <br/> {currentListing.game.publisher}</p>
                    {currentListing.game.description &&
                    <p>Description: <br/> {currentListing.game.description}</p>}
                    <p>Year of Publication: <br/> {currentListing.game.board_game?.year_published}</p>
                    <p>Number of Players:</p>
                    <Container className="rating_container">
                        <ReactStars
                            count={maxPlayers}
                            size={30}
                            value={maxPlayers}
                            emptyIcon={<VscPerson />}
                            filledIcon={<VscPerson />}
                            activeColor="#100071"
                        />
                    </Container>
                    <p>Playing Time: <br/> {currentListing.game.playing_time}</p>
                    <p>Complexity: <br/> {parseFloat(currentListing.game.complexity).toFixed(1)}</p>
                    <p>Preservation Rate:</p>
                    <Container className="rating_container">
                        <ReactStars
                            count={5}
                            size={30}
                            value={currentListing.game.grade}
                            emptyIcon={<FaStar />}
                            filledIcon={<FaStar />}
                            activeColor="#ffd700"
                        />
                    </Container>
                </>
            </Modal.Body>
            <Modal.Footer>
                <p>Owned by: {listing.profile.email}</p>
            </Modal.Footer>
        </Modal>
    );
}