import { Button, Container, Spinner } from 'react-bootstrap';
import { Homepage_header } from '../components/Homepage_header.jsx';
import { Logged_homepage_header } from './../components/Logged_homepage_header.jsx'
import { useAuth } from '../components/AuthProvider.jsx';
import { ButtonGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import './../styles/homepage.css';
import { Welcome } from '../components/Welcome.jsx';

export function Homepage() {
    const {registrationStep, loading} = useAuth();
    const navigate = useNavigate();

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
                        <Button className='home_button' id="nav_button">Wishlist</Button>
                    </ButtonGroup>
                </div>}
            <Welcome />
        </Container>
    )
};