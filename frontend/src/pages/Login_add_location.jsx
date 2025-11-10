import { Container, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useState } from "react";
import apiAuth from './../services/apiAuth.js';
import { deleteTokenFromVariable } from "../services/auth.js";
import { useAuth } from "../components/AuthProvider.jsx";
import './../styles/loginpage.css'

export function Login_add_location() {
    const navigate = useNavigate();
    const [warningMess, setWarningMess] = useState('');
    const { registrationStep, setRegistrationStep } = useAuth();

    const logoutUser = async () => {
        try {
            await apiAuth.post('logout/');
            //ako je uspješno -> 200:
            deleteTokenFromVariable();
            setRegistrationStep(1);
            navigate('/login');
        } catch(error) {
            if(error.response) {
                console.log(error.response.data.detail);
                setWarningMess(error.response.data.detail);
            } else {
                console.log("Network error or server down!");
                setWarningMess("Server unreachable!");
            }
        }
    }

    return(
        <Container className="body_container">
            <h2>Please, select your location:</h2>
            <Container className="map_container">Place for map</Container>
            <Button className="home_button" onClick={logoutUser}>
                Select different Google account
            </Button>
            {warningMess && <Alert variant="danger" className="my_alert mt-4" onClose={() => {setWarningMess('')}} dismissible>
                <Alert.Heading>
                    Error!
                </Alert.Heading>
                <p className="text-center">
                    {warningMess}
                </p>
            </Alert>}
        </Container>
    )
}