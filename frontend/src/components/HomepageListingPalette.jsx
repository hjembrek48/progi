import { useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { ListingCard } from "./ListingCard";
import { ListingCardBigger } from "./ListingCardBigger";
import { Link, Element } from "react-scroll";
import './../styles/homepage.css';

const max_per_page = 5;

export function HomepageListingsPalette({ listings }) {
const [index, setIndex] = useState(0);
    const [sortedListings, setSortedListings] = useState([]);
    const [visibleListings, setVisibleListings] = useState([]);
    const [selectedListing, setSelectedListing] = useState(null);

    useEffect(() => {
        const sorted = [...listings].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setSortedListings(sorted);
        if (index >= sorted.length) {
            setIndex(Math.max(0, sorted.length - max_per_page));
        }
    }, [listings]);

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
        <Container className="games_palette">
            <Link to="homepage_scroll" smooth duration={400}>
                <Button className="goButton" onClick={goUp} disabled={index === 0}>
                    <span className='arrow'>&#128897;</span>
                    <p>Go Up</p>
                </Button>
            </Link>
            <Element name="homepage_scroll" />
            <Container className="game_palette_row">
                {visibleListings.map((listing) => (
                <ListingCard
                key={listing.id}
                listing={listing}
                onClick={() => setSelectedListing(listing)}
                />
                ))}
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
    );
}