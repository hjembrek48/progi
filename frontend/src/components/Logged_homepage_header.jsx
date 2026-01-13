import { Row, Col, Container, Button } from "react-bootstrap";
import { CgProfile } from "react-icons/cg";
import { RiLogoutBoxLine } from "react-icons/ri";
import { useAuth } from "./AuthProvider";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import apiAuth from "../services/apiAuth.js";
import { deleteTokenFromVariable } from "../services/auth.js";
import './../styles/homepage.css'
import logo from "../assets/Logo.png"

export function Logged_homepage_header() {
    const {registrationStep, setRegistrationStep} = useAuth();
    const [warningMess, setWarningMess] = useState('');
    const navigate = useNavigate();

    const logout = async () => {
        try{
            await apiAuth.post('logout/');
            deleteTokenFromVariable();
            setRegistrationStep(1);
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
        <Row className='home_header p-2'>
            <Col xs={2} className="d-flex align-items-center">
                <div 
                className="logo_nav"
                onClick={() => navigate('/')}
                >
                    <img src={logo} alt="PlayTrade logo" className="logo img-fluid" />
                </div>
            </Col>
            <Col xs={5} className="d-flex align-items-center">
                <Container>
                    <h1>PlayTrade</h1>
                </Container>
            </Col>
            <Col xs={2} className="d-flex">
                <Button className="home_button d-flex flex-column align-items-center" onClick={() => {navigate('/profile')}}>
                    <CgProfile />
                    <h5>My Profile</h5>
                </Button>
            </Col>
            <Col xs={3} className='d-flex justify-content-end'>
                <Button className='home_button d-flex flex-column align-items-center' onClick={logout}>
                    <h5>Logout</h5>
                    <RiLogoutBoxLine />
                </Button>
            </Col>
        </Row>
    );
}