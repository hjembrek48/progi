import { Button, Container, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router';
import './../styles/homepage.css';
import logo from "../assets/Logo.png"

export function Homepage_header() {
    const navigate = useNavigate();

    return(
        <Row className='home_header p-2'>
            <Col xs={2}>
                <img src={logo} alt="PlayTrade logo" className="logo img-fluid" />
            </Col>
            <Col xs={5}>
                <Container>
                    <h1>PlayTrade</h1>
                </Container>
            </Col>
            <Col xs={5} className='d-flex justify-content-end'>
                <Button className='home_button' onClick={() => {navigate('/login')}}>
                    Log In
                </Button>
            </Col>
        </Row>
    );
}