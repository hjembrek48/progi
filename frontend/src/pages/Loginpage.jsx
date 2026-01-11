/* global google */
import { useEffect } from "react"
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { IoArrowBackSharp } from "react-icons/io5";
import axios from "axios";
import { setAccessToken } from "../services/auth.js";
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Container, Row, Col, Stack } from 'react-bootstrap'
import { LoginHeader } from "../components/Login_Header.jsx";
import { useAuth } from "../components/AuthProvider.jsx";
import './../styles/loginpage.css'
import apiAuth from "../services/apiAuth.js";

export function Loginpage() {
    const navigate = useNavigate();
    const [warningMess, setWarningMess] = useState('');
    const { registrationStep, setRegistrationStep } = useAuth();

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
                    const server_res = await axios.post(`${process.env.REACT_APP_API_URL}/api/google-login/`,
                    {
                        google_access_token: response.access_token
                    }, 
                    {
                        headers: {"Content-Type": "application/json"},
                        //withCredentials: true
                    });
                    //ako smo ovdje - server je vratio status 200
                    setAccessToken(server_res.data.access);
                    //provjera ima li korisnik od prije zadanu lokaciju
                    const location = await apiAuth.get("/profile/location/");
                    //ako korisnik ima zadanu lokaciju
                    if(location.data.latitude != null && location.data.longitude != null) {
                        setRegistrationStep(3);
                        navigate('/');
                    //ako korisnik nema zadanu lokaciju - sljedeći korak - dodavanje lokacije
                    } else {
                        setRegistrationStep(2);
                        navigate('add_location');
                    }
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
                                <Button className="home_button" size="lg" onClick={getAccessToken}><FaGoogle className="boot_icon" size={25} />Log In With Google</Button>
                                <Button className="home_button" size="lg" onClick={() => {navigate('/')}}><IoArrowBackSharp className="boot_icon" size={25} />Back</Button>
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