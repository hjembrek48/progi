/* global google */
import { useEffect } from "react"
import { useState } from "react";
import axios from "axios";
import { setAccessToken } from "../services/auth.js";
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Container, Row, Col, Stack } from 'react-bootstrap'
import { LoginHeader } from "../components/Login_Header.jsx";
import './../styles/loginpage.css'

export function Loginpage() {
    const navigate = useNavigate();
    const [warningMess, setWarningMess] = useState('');

    useEffect(() => {
        //Stavljamo <script> koji učitava Google Identity Services na page
        const element = document.createElement("script");
        element.src="https://accounts.google.com/gsi/client";
        element.async = true;
        element.defer = true;
        document.body.appendChild(element);
        element.onload = () => {
            console.log("google.accounts.oauth2 script added!");
        }

        return () => {
            document.body.removeChild(element);
        }
    }, [])

    const getAccessToken = () => {
        const client = google.accounts.oauth2.initTokenClient({
            client_id: process.env.REACT_APP_CLIENT_ID,
            scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
            callback: async (response) => {
                try {
                    const server_res = await axios.post('http://localhost:8000/api/google-login/',
                    {
                        google_access_token: response.access_token
                    }, 
                    {
                        headers: {"Content-Type": "application/json"},
                        withCredentials: true
                    });
                    //ako smo ovdje - server je vratio status 200
                    setAccessToken(server_res.data.access);
                    //sljedeći korak - dodavanje lokacije
                    navigate('add_location'); // '/login/add_location'
                } catch(error) {
                    //ako smo ovdje - server vratio status >= 400 ili server niti ne radi:
                    if(error.response) {
                        console.log(error.response.data.detail);
                        setWarningMess(error.response.data.detail);
                    } else {
                        console.log("Network error or server down!");
                        setWarningMess("Server unreachable!");
                    }
                }
            }
        });
        client.requestAccessToken();
    }

    return(
        <Container fluid className="body_container min-vh-100">
            <Row>
                <Col>
                    <Row className="mb-3 justify-content-center">
                        <LoginHeader />
                    </Row>
                    <Row className="mb-3">
                        <Container className="body_container">
                            <Stack gap={4} className="col-md-5 mx-auto">
                                <Button className="home_button" size="lg" onClick={getAccessToken}>Log In With Google</Button>
                                <Button className="home_button" size="lg" onClick={() => {navigate('/')}}>Back</Button>
                            </Stack>
                                {warningMess && <Alert variant="danger" className="my_alert mt-4" onClose={() => {setWarningMess('')}} dismissible>
                                    <Alert.Heading>
                                        Error!
                                    </Alert.Heading>
                                    <p className="text-center">
                                        {warningMess}
                                    </p>
                                </Alert>}
                        </Container>
                    </Row>
                </Col>
            </Row>
        </Container>
    )
};