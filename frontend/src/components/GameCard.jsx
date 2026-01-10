import { Card } from "react-bootstrap";

export function GameCard({ game, onClick}) {
    return(
        <Card 
        className="h-100"
        onClick={onClick}
        >
            <Card.Img
            variant="top"
            src={game.photo || game.board_game?.image_url}
            >
            </Card.Img>
            <Card.Body>
                <Card.Title className="fs-6">
                    {game.name}
                </Card.Title>
                <Card.Text className="small">
                    {new Date(game.created_at).toLocaleDateString()}
                </Card.Text>
            </Card.Body>
        </Card>
    );
}