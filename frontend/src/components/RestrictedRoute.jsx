import { Navigate, useNavigate } from "react-router";
import { useAuth } from "./AuthProvider";
import { Container, Spinner, Button } from "react-bootstrap";

export function RestrictedRoute({ children, maxStep }) {
    const {registrationStep, setRegistrationStep} = useAuth();
    const navigate = useNavigate()

    if(registrationStep === null || registrationStep === undefined) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
                <p>Loading...</p>
            </Container>
        );
    }

    if(registrationStep === 0) { //Ako se dogodi server error
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
                <p>Server error. Try again later.</p>
                <Button onClick={() => {navigate(-1)}} className="mt-3">
                    Go back
                </Button>
            </Container>
        );
    }

    if(maxStep < registrationStep) {
        return <Navigate to="/" replace />;
    }

    return children;
}