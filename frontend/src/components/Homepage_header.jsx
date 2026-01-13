import { Button, Container, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router';
import './../styles/homepage.css';
import logo from "../assets/Logo.png"

export function Homepage_header() {
    const navigate = useNavigate();

    return(
        <Row className='home_header p-2'>
            <Col xs={2} className="d-flex align-items-center">
                <div 
                className="logo_nav"
                onClick={() => navigate('/')}
                >
                    <img src={logo} alt="PlayTrade logo" className="logo img-fluid" />
                </div>
            </Col>
            <Col xs={5} className="d-flex align-items-center">
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