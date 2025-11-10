import { Row, Col, Container, Button } from "react-bootstrap";
import apiAuth from './../services/apiAuth.js';
import { CgProfile } from "react-icons/cg";
import { RiLogoutBoxLine } from "react-icons/ri";
import { useAuth } from "./AuthProvider";
import { deleteTokenFromVariable } from "../services/auth.js";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './../styles/homepage.css'

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
            <Col xs={2}>
                Icon
            </Col>
            <Col xs={5}>
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