import { Button, Container } from 'react-bootstrap';
import { Logged_homepage_header } from './../components/Logged_homepage_header.jsx'
import { ButtonGroup } from 'react-bootstrap';
import { AddGameWindow } from '../components/AddGameWindow.jsx'
import './../styles/homepage.css';
import { useState, useEffect } from 'react';
import apiAuth from '../services/apiAuth.js';
import { NoMyGamesPalette } from '../components/NoMyGamesPalette.jsx';
import { MyGamesPalette } from '../components/MyGamesPalette.jsx';
import { FaPlusCircle } from "react-icons/fa";

export function MyGames() {
    const [isAddGameOpen, setIsAddGameOpen] = useState(false);
    const [myGames, setMyGames] = useState([]);

    const fetchMyGames = async () => { //pozivat ćemo kod mounta i kod dodavanja igre
            try {
                const res = await apiAuth("games");
                if(res.data.length > 0) {
                    setMyGames(res.data);
                }
            } catch (e) {
                console.log("Failed to fetch your games!");
            }
        }

    useEffect(() => {
        fetchMyGames();
    }, []) //samo kod mounta komponente

    return(
        <Container>
            <Logged_homepage_header />
                <div className='homepage-button-bar-container p-2'>
                    <ButtonGroup>
                        <Button className='home_button' id="nav_button">My Games</Button>
                        <Button className='home_button' id="nav_button">My Trades</Button>
                        <Button className='home_button' id="nav_button">Offers</Button>
                        <Button className='home_button' id="nav_button">Wishlist</Button>
                    </ButtonGroup>
                </div>
                {(myGames.length > 0) && <MyGamesPalette my_games={myGames} />}
                {(myGames.length == 0) && <NoMyGamesPalette />}

                <Container className='add_game_button_wrapper'>
                    <Button className='add_game_button' onClick={() => {setIsAddGameOpen(true)}}>
                        <FaPlusCircle />
                        <span>Add Game</span>
                    </Button>
                </Container>
                {isAddGameOpen && <AddGameWindow 
                                    onClose={() => {setIsAddGameOpen(false)}} 
                                    onGameAdded={() => {fetchMyGames()}}
                                    />}
        </Container>
    )
};