import { Button, Modal, Container } from "react-bootstrap";
import ReactStars from "react-rating-stars-component";
import { FaStar } from "react-icons/fa";
import { VscPerson } from "react-icons/vsc";
import { FaPencil } from "react-icons/fa6";
import './../styles/homepage.css';
import { useState } from "react";
import { EditGameWindow } from "./EditGameWindow";
import { useEffect } from "react";
import apiAuth from "../services/apiAuth";

export function GameCardBigger({ game, onClose, onDelete, listings, onListingChange, readOnly = false }) {
    const [editing, setEditing] = useState(false);
    const [gameInListing, setGameInListing] = useState(false);
    const [gameInUnlisting, setGameInUnlisting] = useState(false);
    const [genres, setGenres] = useState([]);
    const [currentGame, setCurrentGame] = useState(game);

    const listing = listings.find((l) => l.game.id === currentGame.id); //tražimo je li ova igra u listanima
    const gameListed = Boolean(listing);

    useEffect(() => {
        setCurrentGame(game);
    }, [game]);

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

    const currentGenre = genres.find((genre) => genre.id === currentGame.genre.id)?.name || "—";
    
    // listing button handler:
    const handleListGame = async () => {
        if(gameInListing) return;
        setGameInListing(true);
        try {
            const res = await apiAuth.post("listings/", {
                game_id: currentGame.id,
                description: currentGame.description || ""
            });
            alert("Game successfully listed!");
            onListingChange();
        } catch (error) {
            console.error("Listing error:", error);
            alert("Listing failed.");
        } finally {
            setGameInListing(false);
        }
    };

    // unlisting button handler:
    const handleUnlistGame = async () => {
        if(gameInUnlisting) return;
        if (!window.confirm("Do you want to withdraw this listing? (Game will stay in your collection)")) return;
        setGameInUnlisting(true);

        const listing = listings.find((l) => l.game.id === currentGame.id); //tražimo je li ova igra u listanima
        if (!listing) return; //ako nije u listanima -> return
        
        try {
            await apiAuth.delete(`listings/${listing.id}/`);
            alert("Listing withdrawed.");
            onListingChange();
        } catch (error) {
            console.error("Error while withdrawing listing:", error);
            alert("Listing withdrawal failed!");
        } finally {
            setGameInUnlisting(false);
        }
    };

    const maxPlayers = Number(currentGame.max_players) || 0;

    return(
        <Modal show centered size="lg" onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {currentGame.name}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className={gameListed ? "game_card_bigger_listed" : "game_card_bigger_unlisted"}>
                {(gameListed && !editing) && <div className="listed_badge">Listed</div>}
                {editing == true ? <EditGameWindow 
                                    game={currentGame} 
                                    onDone={(gameUpdated) => {
                                        if(gameUpdated) {
                                            setCurrentGame(gameUpdated);
                                            onListingChange();
                                        }
                                        setEditing(false);
                                    }}
                                    /> :
                    (<>
                        <img 
                        src={currentGame.photo || currentGame.board_game?.image_url}
                        alt={currentGame.board_game?.name}
                        className="img-fluid mb-3"
                        />
                        
                        <p>Genre: <br/> {currentGenre} </p>
                        <p>Publisher: <br/> {currentGame.publisher}</p>
                        {currentGame.description &&
                        <p>Description: <br/> {currentGame.description}</p>}
                        <p>Year of Publication: <br/> {currentGame.board_game?.year_published}</p>
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
                        <p>Playing Time: <br/> {currentGame.playing_time}</p>
                        <p>Complexity: <br/> {parseFloat(currentGame.complexity).toFixed(1)}</p>
                        <p>Preservation Rate:</p>
                        <Container className="rating_container">
                            <ReactStars
                                count={5}
                                size={30}
                                value={currentGame.grade}
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
                {!readOnly && (
                    <>
                        {gameListed ? (
                            <Button
                            variant="warning" 
                            onClick={() => handleUnlistGame()}
                            disabled={gameInUnlisting ? true : false}
                            >
                                {gameInUnlisting ? "Unlisting Game ..." : "Unlist Game"}
                            </Button>
                        ) : (
                            <Button
                            variant="success" 
                            onClick={() => handleListGame()}
                            disabled={gameInUnlisting ? true : false}
                            >
                                {gameInListing ? "Listing Game ..." : "List Game"}
                            </Button>
                        )}
                        <Button className="button_type3" onClick={() => setEditing(true)}>
                            <FaPencil />
                            Edit Game
                        </Button>
                        <Button className="button_type1"
                        onClick={() => {onDelete(currentGame.id); onClose();}}>
                            Delete Game
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
}