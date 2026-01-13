import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import "./../styles/homepage.css";

export function Welcome() {
    const navigate = useNavigate();
    const { registrationStep } = useAuth();
    return (
        <div className="welcome_background">
            <Container className="welcome_container text-center">
                <h1 className="welcome_title"><strong>Welcome to PlayTrade</strong></h1>
                <p className="welcome_subtitle">
                    <strong>Your place to trade board games you love</strong>
                    <br/>
                    <strong>(and the ones you don't play anymore)</strong>
                </p>

                {(registrationStep == 1) && 
                (<Button
                className="home_button welcome_button"
                onClick={() => navigate("/login")}
                >
                    Get Started
                </Button>
                )}
            </Container>
        </div>
    );
}