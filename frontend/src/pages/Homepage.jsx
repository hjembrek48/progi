import { Button, Container, Spinner } from 'react-bootstrap';
import { Homepage_header } from '../components/Homepage_header.jsx';
import { Logged_homepage_header } from './../components/Logged_homepage_header.jsx'
import { useAuth } from '../components/AuthProvider.jsx';
import { ButtonGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import './../styles/homepage.css';
import { Welcome } from '../components/Welcome.jsx';
import apiAuth from '../services/apiAuth.js';
import { useState, useEffect } from 'react';
import { HomepageListingsPalette } from '../components/HomepageListingPalette.jsx';

export function Homepage() {
    const [listings, setListings] = useState([]);
    const [loadingListings, setLoadingListings] = useState(true);
    const {registrationStep, loading} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if(loading) return; //nema fetchanja listinga dok se ne očita registrationStep
        const fetchListings = async () => {
            try {
                const res = await apiAuth.get("listings/");
                if(registrationStep < 3) {
                    setListings(res.data);
                } else {
                    const profile_res = await apiAuth.get("profile/");
                    setListings(res.data.filter(t => t.profile.id !== profile_res.data.id));
                }
            } catch (err) {
                console.error("Failed to fetch listings:", err);
            } finally {
                setLoadingListings(false);
            }
        }
        fetchListings();
        const interval = setInterval(fetchListings, 5000); //svakih 5 sec dohvaćaj igre
        return () => clearInterval(interval);
    }, [registrationStep]); //ovo ide u dependency jer se authContext još nije učitao kod 1. rendera

    if(loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
                <p>Loading...</p>
            </Container>
        );
    }

    return(
        <Container>
            {registrationStep > 2 ? <Logged_homepage_header /> : <Homepage_header />}
            {registrationStep > 2 &&
                <div className='homepage-button-bar-container p-2'>
                    <ButtonGroup>
                        <Button className='home_button' id="nav_button" onClick={() => navigate('my_games')}>My Games</Button>
                        <Button className='home_button' id="nav_button" onClick={() => navigate('mytrades')}>My Trades</Button>
                        <Button className='home_button' id="nav_button" onClick={() => navigate('offers')}>Offers</Button>
                        <Button className='home_button' id="nav_button" onClick={() => navigate('wishlist')}>Wishlist</Button>
                    </ButtonGroup>
                </div>}
            <Welcome />
            <Container className='basic_container'>
                {loadingListings && (
                <Container className="text-center mt-5">
                    <Spinner animation="border" />
                    <p>Loading newest listed games...</p>
                </Container>)}

                {!loadingListings && 
                    (<Container>
                        <div className="container-header">
                            <h1>Newest listed games:</h1>
                        </div>
                        <HomepageListingsPalette listings={listings} />
                    </Container>)
                }
            </Container>
        </Container>
    )
};