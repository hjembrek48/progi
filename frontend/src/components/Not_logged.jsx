import { Container, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router";
import './../styles/not_logged.css';

export function Not_logged() {
    const navigate = useNavigate();

    return(
        <Container className="not_logged_container d-flex justify-content-center align-items-center">
            <div className="card text-center p-4">
                <div className="icon">!</div>
                <p className="not_logged_mess">
                    You need to register or log in to see this.
                </p>
                <Row>
                    <Col className="d-flex justify-content-center mb-2">
                        <Button className="home_button w-100" onClick={() => {navigate(-1)}}>
                            Go Back
                        </Button>
                    </Col>
                    <Col className="d-flex justify-content-center">
                        <Button className="home_button w-100" onClick={() => {navigate('/login')}}>
                            Go To Login Page
                        </Button>
                    </Col>
                </Row>
            </div>
        </Container>
    );
}