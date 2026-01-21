import { Accordion, Button, Container, Spinner } from 'react-bootstrap';
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
import { GiPerspectiveDiceSixFacesSix } from "react-icons/gi";
import { FaPlus } from "react-icons/fa6";
import { FaUserLock } from "react-icons/fa";
import { FaMap } from "react-icons/fa6";
import { FaHandshake } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { FaHeart } from "react-icons/fa";
import { FaFlag } from "react-icons/fa";
import { Element } from "react-scroll";

export function Homepage() {
    const [listings, setListings] = useState([]);
    const [loadingListings, setLoadingListings] = useState(true);
    const {registrationStep, loading} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if(loading) return; //nema fetchanja listinga dok se ne očita registrationStep

        setListings([]);
        setLoadingListings(true);
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
                        <HomepageListingsPalette listings={listings} preferences={false} />
                    </Container>)
                }
            </Container>
            {(registrationStep > 2) && <Container className='basic_container'>
                {loadingListings && (
                <Container className="text-center mt-5">
                    <Spinner animation="border" />
                    <p>Loading games you may like...</p>
                </Container>)}

                {!loadingListings && 
                    (<Container>
                        <HomepageListingsPalette listings={listings} preferences={true} />
                    </Container>)
                }
            </Container>}
            <Element name="app_usage">
                <Container className='homepage-accordion'>
                    <Accordion defaultActiveKey={null} alwaysOpen>
                        <Accordion.Item eventKey='0'>
                            <Accordion.Header>
                                <GiPerspectiveDiceSixFacesSix />
                                <p>About the app</p>
                            </Accordion.Header>
                            <Accordion.Body>
                                PlayTrade is a board game exchange platform where users can
                                list their games and trade them with others.
                                <br/>
                                The goal is to make board games more accessible, reusable, and fun to everyone.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey='1'>
                            <Accordion.Header>
                                <FaUserLock />
                                <p>How to log in / register</p>
                            </Accordion.Header>
                            <Accordion.Body>
                                Go to <strong>Log In</strong> in the top menu to sign in or 
                                create a new account using your google account. Registration is
                                quick and allows you to enhance your user expirience. It allows you
                                to start adding games, trading with others and managing your profile.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey='2'>
                            <Accordion.Header>
                                <FaMap />
                                <p>Explore listed games</p>
                            </Accordion.Header>
                            <Accordion.Body>
                                Browse the <strong>Newest listed games</strong> on the homepage to find
                                games that other users are offering. You can click on any game card to view
                                details about that game or start a trade.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey='3'>
                            <Accordion.Header>
                                <FaPlus />
                                <p>How to add a game</p>
                            </Accordion.Header>
                            <Accordion.Body>
                                Go to <strong>My Games</strong> and click on <strong>Add Game</strong>.
                                Choose one of offered game names, select game genre, write game publisher,
                                rate its condition, upload a photo, and if you want add description. You can also
                                select to add your game to listing if you want. Once added, your game will become
                                visible inside to you. By clicking on game card, you can edit, delete, list and unlist them.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey='4'>
                            <Accordion.Header>
                                <FaHandshake />
                                <p>How to make an offer</p>
                            </Accordion.Header>
                            <Accordion.Body>
                                Open a game listing you like and click on <strong>Request trade</strong>.
                                Select game or games you want from other person and game or games that you want to trade
                                and send the offer. The owner will be notified and can accept, edit or decline offer,
                                so can you.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey='5'>
                            <Accordion.Header>
                                <FaBell />
                                <p>Your notifications</p>
                            </Accordion.Header>
                            <Accordion.Body>
                                Notifications keep you informed about new trade offers, accepted or declined trades
                                and offer edits. Click the <strong>bell icon</strong> in the header to view them.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey='6'>
                            <Accordion.Header>
                                <CgProfile />
                                <p>Your profile</p>
                            </Accordion.Header>
                            <Accordion.Body>
                                To see your profile click on <strong>My Profile</strong>. In your profile, you can
                                view your personal info, change your username, profile photo and description. You can also
                                add preference game genres. If you do that, app will suggest you listed games based on them.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey='7'>
                            <Accordion.Header>
                                <FaHeart />
                                <p>Wishlist</p>
                            </Accordion.Header>
                            <Accordion.Body>
                                Add games to your <strong>Wishlist</strong> to keep track of games you want. When a wished game becomes
                                available, you will get a notification and you can quickly make an offer.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey='8'>
                            <Accordion.Header>
                                <FaFlag />
                                <p>Reporting bad behaviour and inappropriate content</p>
                            </Accordion.Header>
                            <Accordion.Body>
                                If you encounter inappropriate language, offensive behaviour or suspicious activity on
                                listings and offers, you can report it directly with clicking on <strong>Report</strong> so
                                our admins can see them and take appropriate action when necessary.
                                <br/><br/>
                                Reports help keep the community safe and respectful. <strong>Please refrain yourself from posting
                                inappropriate content and bad behaviour. Such actions will be subject to penalties such as
                                deleting posts and banning profiles.</strong>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Container>
            </Element>
        </Container>
    )
};