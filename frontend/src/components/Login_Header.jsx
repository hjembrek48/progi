import { Container } from "react-bootstrap";
import './../styles/loginpage.css'

export function LoginHeader() {
    return (
        <Container fluid className="login_header p-5 my-5">
            <h1>Login:</h1>
        </Container>
    );
}