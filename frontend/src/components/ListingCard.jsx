import { Card, Container } from "react-bootstrap";
import "./../styles/homepage.css"

export function ListingCard({ listing, onClick }) {
    return(
        <Card 
        className="game_card_unlisted"
        onClick={onClick}
        >
            <Container>
                <Card.Img
                variant="top"
                src={listing.game.photo || listing.game.board_game?.image_url}
                >
                </Card.Img>
            </Container>
            <Card.Body className="card_body">
                <Card.Title className="fs-7 card_title">
                    {listing.game.board_game.name}
                </Card.Title>
                <Container className="inner_badge_container">
                        <Card.Text className="small">
                            {listing.profile.email}
                        </Card.Text>  //KASNIJE PROMIJENI NA USERNAME
                </Container>
                <Container className="date_container">
                    <Card.Text className="small">
                        {new Date(listing.game.created_at).toLocaleString()}
                    </Card.Text>
                </Container>
            </Card.Body>
        </Card>
    );
}