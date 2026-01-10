import { Button, Modal, Container } from "react-bootstrap";
import ReactStars from "react-rating-stars-component";
import { FaStar } from "react-icons/fa";
import { VscPerson } from "react-icons/vsc";
import { FaPencil } from "react-icons/fa6";
import './../styles/homepage.css';
import { useState } from "react";

export function GameCardBigger({ game, onClose }) {
    const [editing, setEditing] = useState(false);
    const [editedGame, setEditedGame] = useState(game);
    if(!game) {
        return null;
    }

    const maxPlayers = Number(game.max_players) || 0;

    return(
        <Modal show centered size="lg" onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {game.name}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                    (<img 
                    src={game.photo || game.board_game?.image_url}
                    alt={game.name}
                    className="img-fluid mb-3"
                    />

                    <p>Publisher: <br/> {game.publisher}</p>
                    {game.description &&
                    <p>Description: <br/> {game.description} </p>}
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
                    <p>Complexity: <br/> {game.complexity}</p>
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
                    </Container>)
            </Modal.Body>
            <Modal.Footer>
                <Button className="" onClick={onClose}>
                    Close
                </Button>
                <Button className="" onClick={setEditing(true)}>
                    <FaPencil />
                    Edit Game
                </Button>
                <Button className="">
                    Delete Game
                </Button>
            </Modal.Footer>
        </Modal>
    );
}