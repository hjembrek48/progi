import { Button, Container, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router';
import './../styles/homepage.css';

export function Homepage_header() {
    const navigate = useNavigate();

    return(
        <Row className='home_header p-2'>
            <Col xs={2}>
                Icon
            </Col>
            <Col xs={7}>
                <Container>
                    <h1>PlayTrade</h1>
                </Container>
            </Col>
            <Col xs={3} className='d-flex justify-content-end'>
                <Button className='home_button' onClick={() => {navigate('login')}}>
                    Log In
                </Button>
            </Col>
        </Row>
    );
}