import { useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { GameCard } from "./GameCard";
import { GameCardBigger } from "./GameCardBigger";
import { FaArrowAltCircleDown } from "react-icons/fa";
import { FaArrowAltCircleUp } from "react-icons/fa";
import apiAuth from "../services/apiAuth";
import './../styles/homepage.css';

//uzima po 5 igara i stavlja ih u redak, gumb za redak gore, gumb za redak dolje
const max_games_per_page = 5;

export function MyGamesPalette({ my_games, onGamesChange }) {
    const [index, setIndex] = useState(0); //indeks prve igre na prikazu
    const [games, setGames] = useState([]); //sve aktivne igre
    const [currentlyShowedGames, setCurrentlyShowedGames] = useState([]); //one igre koje su sad na prikazu
    const [currentlySelectedGame, setCurrentlySelectedGame] = useState(null); //igra koju se sad gleda (prikaz u modalu)

    useEffect(() => {
        setGames(my_games);
        setIndex(0);
    }, [my_games]) //kad se postave nove igre resetaj prikaz

    useEffect(() => {
        setCurrentlyShowedGames(games.slice(index, index + max_games_per_page));
    }, [games, index]) 
    //kad se promijeni index -> idemo gore ili dolje pomoću gumba, moram naći nove showable igre
    //tražim [index, index + 5] igara -> slice će vratiti max koliko ima ako nema točno 5
    //isto i kod dodavanja igre, tj. novi games se šalje u props, isto se trebaju refreshati showable igre

    const handleDelete = async (gameId) => {
        if (!window.confirm("Are you sure that you want to delete this game?")) return;
        try {
            await apiAuth.delete(`games/${gameId}/`);
            alert("Game deleted!");

            try {
                const res = await apiAuth.get("games");
                setGames(res.data);
                setIndex(0);
                setCurrentlySelectedGame(null);
                onGamesChange();
            } catch (e) {
                console.log("Failed to fetch your games!");
            }

        } catch (error) {
            console.error("Error while deleting:", error);
            alert("Delete failed!")
        }
    }

    const tryGoingBack = () => {
        //pomak u lijevo
        let prev_index = index;
        if(prev_index - max_games_per_page > 0) {
            setIndex(prev_index - max_games_per_page)
        } else {
            setIndex(0);
        }
    }

    const tryGoingForward = () => {
        //pomak u desno
        if(index + max_games_per_page >= games.length) return;
        setIndex(index + max_games_per_page);
    }

    return(
        <Container className="games_palette">
            <Button 
            className="goButton" 
            onClick={tryGoingBack}
            disabled={index == 0}
            >
                Go Up <FaArrowAltCircleUp />
            </Button>
                <Container className="games_palette">
                    <Container className="game_palette_row">
                        {currentlyShowedGames.map((game) => (
                            <GameCard 
                            key={game.id} 
                            game={game} 
                            onClick={() => {setCurrentlySelectedGame(game)}}
                            />
                        ))}
                    </Container>
                </Container>
            <Button 
            className="goButton"
            onClick={tryGoingForward}
            disabled={index + max_games_per_page >= games.length}
            >
                Go Down <FaArrowAltCircleDown />
            </Button>

            {currentlySelectedGame && 
                <GameCardBigger 
                className="game_card_whole" 
                game={currentlySelectedGame}
                onClose={() => setCurrentlySelectedGame(null)}
                onDelete={(gameId) => {handleDelete(gameId)}}
                />
            }
        </Container>
    );
}