import { Card } from "react-bootstrap";
import "./../styles/homepage.css"

export function GameCard({ game, listings, onClick }) {

    const isGameListed = listings.find((l) => l.game.id === game.id);
    const resultListing = Boolean(isGameListed);

    return(
        <Card
        className={resultListing ? "game_card_listed" : "game_card_unlisted"}
        onClick={onClick}
        >
            <Card.Img
            variant="top"
            src={game.photo || game.board_game?.image_url}
            >
            </Card.Img>
            <Card.Body className="card_body">
                <Card.Title className="fs-6 card_title">
                    {game.board_game.name}
                </Card.Title>
                <Card.Text className="small">
                    {new Date(game.created_at).toLocaleString()}
                </Card.Text>
            </Card.Body>
        </Card>
    );
}