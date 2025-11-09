import { Container, Spinner } from "react-bootstrap";
import { checkUser } from './../services/checkUser.js'
import { Not_logged } from "./Not_logged.jsx";
import { useState, useEffect } from "react";

export function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [isLogged, setIsLogged] = useState(null);

    useEffect(() => {
        const verify = async () => {
            const logged = await checkUser();
            setIsLogged(logged);
            setLoading(false);
        };
        verify();
    }, []);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
                <p>Loading...</p>
            </Container>
        );
    }
    //korisnik nije prijavljen:
    if (!isLogged) {
        return (<Not_logged />
        );
    }
    //korisnik prijavljen - pusti ga na štićenu rutu:
    return children;
}