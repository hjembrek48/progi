import { useEffect, useState } from "react";
import { Button, Container, Col } from "react-bootstrap";
import { GameCard } from "./GameCard";
import { GameCardBigger } from "./GameCardBigger";
import { FaArrowAltCircleDown } from "react-icons/fa";
import { FaArrowAltCircleUp } from "react-icons/fa";
import './../styles/homepage.css';

//uzima po 5 igara i stavlja ih u redak, gumb za redak gore, gumb za redak dolje

export function MyGamesPalette({ my_games }) {
    const [index, setIndex] = useState(0); //indeks prve igre na prikazu
    const [games, setGames] = useState([]); //sve aktivne igre
    const [currentlyShowedGames, setCurrentlyShowedGames] = useState([]); //one igre koje su sad na prikazu
    const [upPossible, setUpPossible] = useState(0); //koliko redova se može ići gore
    const [downPossible, setDownPossible] = useState(0); //koliko redova se može ići dolje
    const [currentlySelectedGame, setCurrentlySelectedGame] = useState(null); //igra koju se sad gleda (prikaz u modalu)

    useEffect(() => {
        //uzimamo iz baze samo aktivne igre:
        let activeGames = my_games.filter(elem => elem.active === true);
        setGames(activeGames);

        //postavljamo početno br. redova koliko se može dolje
        if((games.length % 5 == 0)) { //dok je točno 5, 10, 20 igara - rubni slučaj
            setDownPossible((games.length / 5) - 1);
        } else {
            setDownPossible(games.length / 5);
        }
        selectFive(index); //postavljamo prvih 5 (ili manje igara) na zaslon
    }, []) //na mount izvršavamo sve ovo

    function selectFive(index) {
        let gamesLen = games.length;
        if((gamesLen - index) > 5) { //ako imamo 5 ili više neprikazanih -> uzmi 5 za prikaz
            setCurrentlyShowedGames(games.slice(index, (index + 5)));
        } else if((gamesLen - index) == 0) { //ako npr. imamo 10, prikažemo svih 10 i onda više ne prikazujemo
            return;
        } else { //inače uzmi onoliko koliko ima
            setCurrentlyShowedGames(games.slice(index, index + (gamesLen - index)));
        }
    }

    const tryGoingBack = () => {
        if(upPossible < 1) return;

        //pomak u lijevo
        if(index >= 5) {
            setIndex(index - 5); //ako smo prošli prvih 5 (ili smo na 5), vraćamo se po 5
        } else {
            setIndex(0); //ako imamo manje od 5 vraćamo se na 0, nebitno koliko imali
        }
        setUpPossible(--upPossible);
        setDownPossible(++downPossible);
        selectFive(index);
    }

    const tryGoingForward = () => {
        if(downPossible < 1) return;

        //pomak u desno
        if((games.length - index) >= 5) {
            setIndex(index + 5); //ako imamo dostupno 5 ili više igara, pokazujemo ih 5 pa pomićemo za 5
        } else {
            setIndex(index + games.length - index); //inače pomićemo za koliko imamo
        }
        setDownPossible(--downPossible);
        setUpPossible(++upPossible);
        selectFive(index);
    }

    return(
        <Container className="games_palette">
            <Button 
            className="goButton" 
            onClick={tryGoingBack}
            >
                <FaArrowAltCircleUp />
            </Button>
            {
                <Container className="games_palette">
                    {currentlyShowedGames.map((game) => (
                        <Col>
                            <GameCard game={game} onClick={() => {setCurrentlySelectedGame(game)}}/>
                        </Col>
                    ))}
                </Container>
            }
            <Button 
            className="goButton"
            onClick={tryGoingForward}
            >
                <FaArrowAltCircleDown />
            </Button>

            {currentlySelectedGame && 
                <GameCardBigger 
                className="game_card_whole" 
                game={currentlySelectedGame}
                onClose={() => setCurrentlySelectedGame(null)}
                />
            }
        </Container>
    );
}