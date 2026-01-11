import { Button, Modal, Container } from "react-bootstrap";
import ReactStars from "react-rating-stars-component";
import { FaStar } from "react-icons/fa";
import { VscPerson } from "react-icons/vsc";
import { FaPencil } from "react-icons/fa6";
import './../styles/homepage.css';
import { useState } from "react";
import { EditGameWindow } from "./EditGameWindow";
import apiAuth from "../services/apiAuth";

export function GameCardBigger({ game, onClose, onDelete }) {
    const [editing, setEditing] = useState(false);
    if(!game) {
        return null;
    }
    // listing
    const handleListGame = async () => {
        try {
            await apiAuth.post('listings/', {
                game_id: game.id,
                description: game.description || ""
            });
            alert("Igra je uspješno objavljena!");
            onClose(); 
        } catch (error) {
            console.error("Greška pri listanju:", error);
            alert("Neuspješno listanje.");
        }
    };

    // unlisting
    const handleUnlistGame = async () => {
        if (!window.confirm("Želiš li povući ovaj oglas? Igra će ostati u tvojoj kolekciji.")) return;
        
        try {
            await apiAuth.delete(`listings/${game.listing.id}/`);
            
            alert("Oglas je uklonjen.");
            onClose(); 
        } catch (error) {
            console.error("Greška pri uklanjanju oglasa:", error);
            alert("Neuspješno uklanjanje oglasa.");
        }
    };

    const maxPlayers = Number(game.max_players) || 0;

    return(
        <Modal show centered size="lg" onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {game.name}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {editing == true ? <EditGameWindow game={game} onDone={() => setEditing(false)}/> :
                    (<>
                        <img 
                        src={game.photo || game.board_game?.image_url}
                        alt={game.board_game?.name}
                        className="img-fluid mb-3"
                        />

                        <p>Publisher: <br/> {game.publisher}</p>
                        {game.description &&
                        <p>Description: <br/> {game.description}</p>}
                        <p>Year of Publication: <br/> {game.board_game?.year_published}</p>
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
                        <p>Playing Time: <br/> {game.playing_time}</p>
                        <p>Complexity: <br/> {parseFloat(game.complexity).toFixed(1)}</p>
                        <p>Preservation Rate:</p>
                        <Container className="rating_container">
                            <ReactStars
                                count={5}
                                size={30}
                                value={game.grade}
                                emptyIcon={<FaStar />}
                                filledIcon={<FaStar />}
                                activeColor="#ffd700"
                            />
                        </Container>
                    </>)
                }
            </Modal.Body>
            <Modal.Footer>
                <Button className="button_type1" onClick={onClose}>
                    Close
                </Button>
                {game.listing ? (
                    <Button variant="warning" onClick={handleUnlistGame}>
                        Unlist Game
                    </Button>
                ) : (
                    <Button variant="success" onClick={handleListGame}>
                        List Game
                    </Button>
                )}
                <Button className="button_type3" onClick={() => setEditing(true)}>
                    <FaPencil />
                    Edit Game
                </Button>
                <Button className="button_type1"
                onClick={() => {onDelete(game.id); onClose();}}>
                    Delete Game
                </Button>
            </Modal.Footer>
        </Modal>
    );
}