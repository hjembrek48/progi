import { Row, Col, Container, Button } from "react-bootstrap";
import apiAuth from './../services/apiAuth.js';
import { CgProfile } from "react-icons/cg";
import { RiLogoutBoxLine } from "react-icons/ri";
import { useAuth } from "./AuthProvider";
import { deleteTokenFromVariable } from "../services/auth.js";
import { useState } from "react";
import './../styles/homepage.css'

export function Logged_homepage_header() {
    const {registrationStep, setRegistrationStep} = useAuth();
    const [warningMess, setWarningMess] = useState('');

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
            <Col xs={2}>
                <Button className="d-flex flex-column">
                    <CgProfile />
                    <h5>My Profile</h5>
                </Button>
            </Col>
            <Col xs={3} className='d-flex justify-content-end'>
                <Button className='home_button d-flex flex-column' onClick={logout}>
                    Logout
                    <RiLogoutBoxLine />
                </Button>
            </Col>
        </Row>
    );
}