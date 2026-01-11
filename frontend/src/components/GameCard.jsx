import { Card } from "react-bootstrap";
import "./../styles/homepage.css"

export function GameCard({ game, onClick}) {
    return(
        <Card
        className="h-100 game_card"
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