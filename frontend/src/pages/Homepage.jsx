import { Button, Container } from 'react-bootstrap';
import { Homepage_header } from '../components/Homepage_header.jsx';
import { Logged_homepage_header } from './../components/Logged_homepage_header.jsx'
import { useAuth } from '../components/AuthProvider.jsx';
import { ButtonGroup } from 'react-bootstrap';
import './../styles/homepage.css';

export function Homepage() {
    const {registrationStep, setRegistrationStep} = useAuth();

    return(
        <Container>
            {registrationStep > 2 ? <Logged_homepage_header /> : <Homepage_header />}
        </Container>
    )
};