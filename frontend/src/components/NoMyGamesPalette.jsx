import { Container } from "react-bootstrap";
import "./../styles/homepage.css"

export function NoMyGamesPalette() {
    return(
        <Container className="games_palette">
            <h1>Sorry, you still have no games :(</h1>
        </Container>
    );
}