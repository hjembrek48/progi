import { Container, Button, Row, Col } from "react-bootstrap";
import { IoArrowBackSharp } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthProvider";
import './../styles/not_logged.css';

export function Not_logged() {
    const navigate = useNavigate();
    const {registrationStep, setRegistrationStep} = useAuth();
    const [poruka, setPoruka] = useState('')

    useEffect(() => {
        if(registrationStep === 2) {
            setPoruka("finish registration by adding location");
        } else {
            setPoruka("register or log in");
        }
    }, [registrationStep]);

    return(
        <Container className="not_logged_container d-flex justify-content-center align-items-center">
            <div className="card text-center p-4">
                <div className="icon">!</div>
                <p className="not_logged_mess">
                    You need to {poruka} to see this.
                </p>
                <Row>
                    <Col className="d-flex justify-content-center mb-2">
                        <Button className="home_button w-100" onClick={() => {navigate(-1)}}>
                            Go Back <IoArrowBackSharp className="boot_icon" size={25}/>
                        </Button>
                    </Col>
                    <Col className="d-flex justify-content-center">
                        <Button className="home_button w-100" onClick={() => {
                            if(registrationStep === 2) {
                                navigate('/login/add_location');
                            } else {
                                navigate('/login')
                            }}}>
                            Go To {registrationStep === 2? "Add Location":"Login Page"}
                        </Button>
                    </Col>
                </Row>
            </div>
        </Container>
    );
}