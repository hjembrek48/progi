import { Container } from "react-bootstrap";
import "./../styles/homepage.css";
import { useEffect } from "react";

export function Error_component({ error_text, clearError }) {

    useEffect(() => {
        if(!error_text) return;

        setTimeout(() => {
            clearError("");
        }, 4000)
    }, [error_text, clearError])

    return(
        <Container className="error_box">
            {error_text}
        </Container>
    );
}