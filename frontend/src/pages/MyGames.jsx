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
import { useNavigate } from 'react-router';
import Loading from '../components/Loading';

export function MyGames() {
    const [isAddGameOpen, setIsAddGameOpen] = useState(false);
    const [myGames, setMyGames] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchMyGames = async () => { //pozivat ćemo kod mounta i kod dodavanja igre
        try {
            const res = await apiAuth("games");
            if(res.data.length > 0) {
                setMyGames(res.data);
            } else {
                setMyGames([]);
            }
        } catch (e) {
            console.log("Failed to fetch your games!");
        }
    }

    const fetchMyListings = async () => { //pozivamo kod dodavanja igre da se listing odmah vizualno zabilježđi
        try {
            const res = await apiAuth.get("listings/");
            setMyListings(res.data);
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        const refreshData = async () => {
            try {
                setLoading(true);
                await Promise.all([
                    fetchMyGames(),
                    fetchMyListings(),
                ]);
            } finally {
                setLoading(false);
            }
        };
        refreshData();
    }, []) //samo kod mounta komponente

    return(
        <Container>
            <Logged_homepage_header />
                <div className='homepage-button-bar-container p-2'>
                    <ButtonGroup>
                        <Button className='home_button' id="nav_button" onClick={() => navigate('/')}>Homepage</Button>
                        <Button className='home_button' id="nav_button" onClick={() => navigate('/mytrades')}>My Trades</Button>
                        <Button className='home_button' id="nav_button" onClick={() => navigate('/offers')}>Offers</Button>
                        <Button className='home_button' id="nav_button" onClick={() => navigate('/wishlist')}>Wishlist</Button>
                    </ButtonGroup>
                </div>
                {loading && <Loading size="lg" fullPage={false} className="py-5" />}
                {!loading && (myGames.length > 0) && (
                    <Container className='mt-4 p-4 bg-white rounded'>
                        <div className="container-header">
                                <h1>My Games:</h1>
                        </div>
                        <MyGamesPalette 
                            my_games={myGames} 
                            onGamesChange={async () => {
                                setLoading(true);
                                try {
                                    await Promise.all([fetchMyGames(), fetchMyListings()]);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            myListings={myListings}
                        />
                    </Container>
                )}
                {!loading && (myGames.length === 0) && <NoMyGamesPalette />}

                <Container className='add_game_button_wrapper'>
                    <Button className='add_game_button' onClick={() => {setIsAddGameOpen(true)}}>
                        <FaPlusCircle />
                        <span>Add Game</span>
                    </Button>
                </Container>
                {isAddGameOpen && (
                    <AddGameWindow 
                        onClose={() => {setIsAddGameOpen(false)}} 
                        onGameAdded={async () => {
                            setLoading(true);
                            try {
                                await Promise.all([fetchMyGames(), fetchMyListings()]);
                            } finally {
                                setLoading(false);
                            }
                        }}
                    />
                )}
        </Container>
    )
};