import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import './../styles/no_route.css';
import './../styles/homepage.css';

export function NoRoute() {
    const navigate = useNavigate();

    return (
        <Container className="no_route_container">
            <h1 style={{ fontSize: "6rem", fontWeight: "bold", color: "#C1121F" }}>404</h1>
            <h2>Oops! Page not found.</h2>
            <p>The page you are looking for does not exist.</p>
            <Button
                className="home_button"
                onClick={() => navigate("/")}
            >
                Go back to Homepage
            </Button>
        </Container>
    );
}