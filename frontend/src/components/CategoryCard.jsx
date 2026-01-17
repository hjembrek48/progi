import { Card } from "react-bootstrap";
import './../styles/homepage.css';

export function CategoryCard({ genre, active, onClick }) {
    return (
        <Card
        className={active ? "category_card_active" : "category_card"}
        onClick={() => onClick(genre)}
        >
            <Card.Body className="d-flex justify-content-center align-items-center">
                {genre.name}
            </Card.Body>
        </Card>
    );
}