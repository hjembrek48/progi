import { useEffect, useState } from "react";
import { Button, Container, Card } from "react-bootstrap";
import { ListingCard } from "./ListingCard";
import { ListingCardBigger } from "./ListingCardBigger";
import { Link, Element } from "react-scroll";
import apiAuth from "../services/apiAuth";
import './../styles/homepage.css';
import { CategoryCard } from "./CategoryCard";

const max_per_page = 5;

export function HomepageListingsPalette({ listings }) {
    const [index, setIndex] = useState(0);
    const [sortedListings, setSortedListings] = useState([]);
    const [visibleListings, setVisibleListings] = useState([]);
    const [selectedListing, setSelectedListing] = useState(null);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [allCategoriesActivated, setAllCategoriesActivated] = useState(true);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await apiAuth.get("genres/");
                setGenres(res.data);
            } catch (e) {
                console.log("Failed to fetch game categories!")
            }
        };
    
            fetchGenres();
        }, []) //odmah dohvati žanrove

    /*useEffect(() => {
        const sorted = [...listings].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setSortedListings(sorted);
        if (index >= sorted.length) {
            setIndex(Math.max(0, sorted.length - max_per_page));
        }
    }, [listings]);*/

    useEffect(() => {
        let updatedListings = [...listings];

        if(!selectedGenre) {
            const sorted = updatedListings.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
            setSortedListings(sorted);
            if (index >= sorted.length) {
                setIndex(Math.max(0, sorted.length - max_per_page));
            }
        } else {
            const filtered =updatedListings.filter(listing => listing.game.genre.id === selectedGenre.id
            ).sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
            setSortedListings(filtered);
            setIndex(0);
        }
    }, [selectedGenre, listings])

    useEffect(() => {
        setVisibleListings(
            sortedListings.slice(index, index + max_per_page)
        );
    }, [sortedListings, index]);

    const goUp = () => {
        //pomak u lijevo
            let prev_index = index;
            if(prev_index - max_per_page > 0) {
                setIndex(prev_index - max_per_page)
            } else {
                setIndex(0);
            }
    };

    const goDown = () => {
        //pomak u desno
        if(index + max_per_page >= sortedListings.length) return;
        setIndex(index + max_per_page);
    };

    return (
        <>
        <Element name="homepage_scroll">
            <div>
                <div className="container-header">
                    <h1>Newest listed games:</h1>
                </div>
                <Container className="games_palette">
                    <Link to="homepage_scroll" smooth duration={400}>
                        <Button className="goButton" onClick={goUp} disabled={index === 0}>
                            <span className='arrow'>&#128897;</span>
                            <p>Go Up</p>
                        </Button>
                    </Link>
                    <Element name="homepage_scroll" />
                    <Container className="game_palette_row">
                        {(visibleListings.length > 0) ? 
                            (visibleListings.map((listing) => (
                            <ListingCard
                            key={listing.id}
                            listing={listing}
                            onClick={() => setSelectedListing(listing)}
                            />
                            ))) : (
                                <div className="no_games_in_cat">
                                    No listed games in that category!
                                </div>
                            )
                        }
                    </Container>
                    <Link to="homepage_scroll" smooth duration={400}>
                        <Button
                        className="goButton"
                        onClick={goDown}
                        disabled={index + max_per_page >= sortedListings.length}
                        >
                            <span className='arrow'>&#128899;</span>
                            <p>Go Down</p>
                        </Button>
                    </Link>
                    {selectedListing && (
                        <ListingCardBigger
                        listing={selectedListing}
                        onClose={() => setSelectedListing(null)}
                        />
                    )}
                </Container>
            </div>
        </Element>
        <Container className="categories_container">
            {genres.map((genre) => (
                <CategoryCard 
                genre={genre}
                active={selectedGenre && (selectedGenre.id === genre.id)}
                onClick={() => {
                    setSelectedGenre(genre);
                    setAllCategoriesActivated(false);
                }
            }
                />
            ))}
            <Card className={allCategoriesActivated ? "category_card_active" : "category_card"}
                onClick={() => {
                    setSelectedGenre(null);
                    setAllCategoriesActivated(true);
                }}
            >
                <Card.Body className="d-flex justify-content-center align-items-center">
                    ALL CATEGORIES
                </Card.Body>
            </Card>
        </Container>
        </>
    );
}