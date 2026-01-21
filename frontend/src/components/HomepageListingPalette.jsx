import { useEffect, useState, useRef } from "react";
import { Button, Container, Card, Overlay, Popover } from "react-bootstrap";
import { ListingCard } from "./ListingCard";
import { ListingCardBigger } from "./ListingCardBigger";
import apiAuth from "../services/apiAuth";
import './../styles/homepage.css';
import { CategoryCard } from "./CategoryCard";
import { useNavigate } from "react-router";
import { AiFillCaretUp } from "react-icons/ai";
import { AiFillCaretDown } from "react-icons/ai";
import { PiSmileySadBold } from "react-icons/pi";

const max_per_page = 5;

export function HomepageListingsPalette({ listings, preferences }) {
    const [index, setIndex] = useState(0);
    const [sortedListings, setSortedListings] = useState([]);
    const [visibleListings, setVisibleListings] = useState([]);
    const [selectedListing, setSelectedListing] = useState(null);
    const [genres, setGenres] = useState([]);
    const [preferedGenres, setPreferedGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [allCategoriesActivated, setAllCategoriesActivated] = useState(true);
    const [show, setShow] = useState(false);
    const [target, setTarget] = useState(null);
    const navigate = useNavigate();
    const ref = useRef(null);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await apiAuth.get("genres/");
                setGenres(res.data);
            } catch (e) {
                console.log("Failed to fetch game categories!")
            }
        };
        
        const fetchPreferedGenres = async () => {
            try {
                const res = await apiAuth.get("profile/");
                setPreferedGenres(res.data.interests);
            } catch (e) {
                console.log("Failed to fetch prefered genres!");
            }
        }
    
            fetchGenres();
            if(preferences) {
                fetchPreferedGenres();
            }
        }, []) //odmah dohvati žanrove i preferirane žanrove (ako je prikaz za preferences)

    useEffect(() => {
        let updatedListings = [...listings];

        //ako koristimo prikaz kao prikaz preferiranih igri (preferences == true) izvršavamo ovaj filter:
        if(preferences) {
            updatedListings = updatedListings.filter(listing => preferedGenres.some(g => g.id === listing.game.genre.id)
            );
        }

        //ako koristimo prikaz za prikaz svih igara, ali sortitrano po određenoj kategoriji izvršavamo ovaj filter:
        if(!preferences && selectedGenre) {
            updatedListings = updatedListings.filter(listing => listing.game.genre.id === selectedGenre.id
            );
        }
        
        //uvijek na kraju ide sort - bilo odabrano samo preferirano, samo jedna kategorija ili sve
        updatedListings = updatedListings.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setSortedListings(updatedListings);
        //vrati na zadnju moguću stranicu
        if (index >= updatedListings.length) {
            setIndex(Math.max(0, updatedListings.length - max_per_page));
        }
    }, [selectedGenre, listings, preferences, preferedGenres])

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

    const handleInfo = (e) => {
        setShow(!show);
        setTarget(e.target);
    }

    return (
        <>
            <div>
                <div className="container-header">
                    <h1>{preferences ? "Listed games you may like:" : "Newest listed games:"}</h1>
                    {preferences &&
                    (
                    <>
                        <span
                        ref={ref}
                        className="info_overlay"
                        >
                            <Button onClick={handleInfo}>
                                Click to see info
                                <Overlay
                                show={show}
                                target={target}
                                placement="bottom"
                                container={ref}
                                containerPadding={20}
                                >
                                    <Popover className="popover-preferences">
                                        <Popover.Header as="h3">What are preferences?</Popover.Header>
                                        <Popover.Body>
                                            <strong>Preferences are your favorite game genres. 
                                                    We show you games that match your interests.
                                                    <br/>
                                                    <br/>
                                                    You can update your preferences in your profile.
                                            </strong>
                                        </Popover.Body>
                                    </Popover>
                                </Overlay>
                            </Button>
                        </span>
                    </>
                    )}
                </div>
                <Container className="games_palette">
                    <Button className="goButton"
                    onClick={goUp} 
                    disabled={index === 0}
                    >
                        <AiFillCaretUp />
                        <p>Go Up</p>
                    </Button>
                    <Container className="game_palette_row">
                        {(visibleListings.length > 0) ? 
                            (visibleListings.map((listing) => (
                            <ListingCard
                            key={listing.id}
                            listing={listing}
                            preferences={preferences}
                            onClick={() => setSelectedListing(listing)}
                            />
                            ))) : (
                                <div className="no_games_in_cat">
                                    {preferences ? 
                                    (preferedGenres.length == 0 ?
                                        <div className="prefer-text">
                                            You didn't set your prefered categories!
                                            You can do that{" "}
                                            <span 
                                            className="link_to_pref"
                                            onClick={() => navigate("category-wishlist")}
                                            >
                                                <strong>here</strong>
                                            </span>.
                                        </div>
                                        :
                                        <div className="prefer-text">
                                            Currenty, we don't have listed games to offer you!
                                            <p><PiSmileySadBold /></p>
                                            
                                        </div>
                                    )
                                    :
                                    <div className="prefer-text">
                                        No listed games in that category!
                                    </div>
                                    }
                                </div>
                            )
                        }
                    </Container>
                    <Button
                    className="goButton"
                    onClick={goDown}
                    disabled={index + max_per_page >= sortedListings.length}
                    >
                        <AiFillCaretDown />
                        <p>Go Down</p>
                    </Button>
                    {selectedListing && (
                        <ListingCardBigger
                        listing={selectedListing}
                        onClose={() => setSelectedListing(null)}
                        />
                    )}
                </Container>
            </div>
        {!preferences &&
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
        }
        </>
    );
}