import React, { useEffect, useState } from "react";
import apiAuth from "../services/apiAuth";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // 1. Uvezi useNavigate

export function Marketplace() {
    const [listings, setListings] = useState([]);
    const navigate = useNavigate(); // 2. Inicijaliziraj navigate

    useEffect(() => {
        apiAuth.get("listings/")
            .then(res => setListings(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Sve objave za zamjenu</h2>
            <Row>
                {listings.map((listing) => (
                    <Col key={listing.id} sm={12} md={6} lg={4} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            <Card.Img 
                                variant="top" 
                                src={listing.game.photo || listing.game.board_game?.image_url} 
                                style={{ height: "200px", objectFit: "cover" }}
                            />
                            <Card.Body>
                                <Card.Title>{listing.game.name}</Card.Title>
                                <Card.Text>
                                    <Badge bg="info" className="me-2">
                                        {listing.game.publisher}
                                    </Badge>
                                    <Badge bg="secondary">
                                        Očuvanost: {listing.game.grade}/5
                                    </Badge>
                                </Card.Text>
                                <p className="small text-muted">
                                    <strong>Vlasnik:</strong> {listing.profile.email || "Korisnik"}<br/>
                                    <strong>Lokacija:</strong> {listing.profile.address || "Nepoznato"}
                                </p>
                                <div className="d-grid">
                                    {/* 3. Dodaj onClick koji vodi na rutu s gameId-jem */}
                                    <Button 
                                        variant="outline-primary" 
                                        onClick={() => navigate(`/gameexchange?listingId=${listing.id}`)}
                                    >
                                        Ponudi zamjenu
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}