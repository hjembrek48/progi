import { Container } from 'react-bootstrap' 
import { Homepage_header } from '../components/Homepage_header.jsx'
import './../styles/homepage.css';

export function Homepage() {
    return(
        <Container>
            <Homepage_header />
        </Container>
    )
};