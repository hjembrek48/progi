import { Button, Container, Form, Spinner } from "react-bootstrap";
import { useAuth } from "../components/AuthProvider";
import "../styles/SearchPage.css";
import { CgSearch } from "react-icons/cg";
import { useEffect, useState } from "react";
import ListingGridElement from "../components/ListingGridElement";
import apiAuth from "../services/apiAuth";
import SmartHomepageHeader from "../components/SmartHomepageHeader";
import { useSearchParams } from "react-router";

function SearchPage() {
  const { registrationStep, setRegistrationStep } = useAuth();
  const sampleGames = [
    {
      id: 0,
      game: {
        id: 0,
        name: "Monopoly",
        publisher: "Hasbro",
        photo:
          "https://cdn.babycenter.si/products/1200x1200/2/2/9/hasbro-games-druzabna-igra-za-2-ali-vec-igralcev-1.jpg",
        genre: {
          id: 3,
          name: "STRATEGY",
        },
      },
      profile: {
        email: "abc@fdsklf",
      },
    },
    {
      id: 1,
      game: {
        id: 1,
        name: "Uno",
        publisher: "Hasbro",
        genre: {
          id: 7,
          name: "CARD",
        },
      },
      profile: {
        email: "abc@fdsklf",
      },
    },
    {
      id: 2,
      game: {
        id: 0,
        name: "Monopoly",
        publisher: "Hasbro",
        genre: {
          id: 3,
          name: "STRATEGY",
        },
      },
      profile: {
        email: "skibid@ohio",
      },
    },
    {
      id: 3,
      game: {
        id: 2,
        name: "Čovječe ne ljuti se",
        publisher: "man",
        genre: {
          id: 3,
          name: "STRATEGY",
        },
      },
      profile: {
        email: "abc@fdsklf",
      },
    },
  ];

  const [searchParams, setSearchParams] = useSearchParams();

  const [filteredGames, setFilteredGames] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [searchError, setSearchError] = useState(false);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const categeories = await apiAuth.get(
          `${process.env.REACT_APP_API_URL}/api/genres`
        );
        setGenres(categeories.data);
      } catch (error) {
        console.error("Ne mogu dohvatiti kategorije igara.");
      }
    };
    const getInitialListing = async () => {
      const query = searchParams.get("search");
      setSearchParams("");
      filterGames({ query: query });
      /*try {
        const res = await apiAuth.get(
          `${process.env.REACT_APP_API_URL}/api/listings`
        );
        setFilteredGames(res.data);
        setResultsLoading(false);
      } catch (error) {
        console.error("Ne mogu dohvatiti igre u ponudi.");
      }*/
    };
    getCategories();
    getInitialListing();
  }, []);

  async function filterGames(queryObject) {
    setResultsLoading(true);
    setSearchError(false);
    const query = queryObject.query;
    const category = queryObject.category;

    let newGames = sampleGames;

    let params = {};

    if (query && query != "") {
      newGames = newGames.filter((e) =>
        e.game.name.toLowerCase().match(query.toLowerCase())
      );
      params.search = query;
    }
    if (category && category != "all") {
      newGames = newGames.filter((e) => e.game.genre.id == category);
      params.genre_id = category;
    }
    try {
      const res = await apiAuth.get(
        `${process.env.REACT_APP_API_URL}/api/listings`,
        {
          params: params,
        }
      );
      setFilteredGames(res.data);
      setResultsLoading(false);
    } catch (error) {
      console.error(error);
      setSearchError(true);
    }
  }

  function handleSubmit(formEvent) {
    formEvent.preventDefault();
    const formData = new FormData(formEvent.target);
    const query = formData.get("query");
    const category = formData.get("category");

    filterGames({ query: query, category: category });
  }

  return (
    <Container>
      <SmartHomepageHeader />
      <div className="dark_green_bg p-3">
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>Search by name:</Form.Label>
            <Form.Control
              type="text"
              name="query"
              defaultValue={searchParams.get("search")}
            ></Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Filter by category</Form.Label>
            <Form.Select name="category">
              <option value={"all"}>All categories</option>
              {genres.map((element) => {
                return (
                  <option value={element.id} key={element.id}>{`${
                    element.name[0]
                  }${element.name.toLowerCase().substr(1)}`}</option>
                );
              })}
            </Form.Select>
          </Form.Group>
          <Button className="home_button mt-3 m-2" type="submit">
            Search/Filter <CgSearch />
          </Button>
        </Form>
      </div>
      {searchError ? (
        <div className="info_container text-danger">
          Server error: couldn't get search results
        </div>
      ) : resultsLoading == true ? (
        <div className="info_container dark_text">
          <Spinner style={{ width: "6rem", height: "6rem" }}></Spinner>
        </div>
      ) : (
        <div>
          {filteredGames.length > 0 ? (
            <div className="results_grid p-2">
              {filteredGames.map((element) => {
                return (
                  <ListingGridElement listing={element} key={element.id} />
                );
              })}
            </div>
          ) : (
            <div className="info_container dark_text">
              <div>No games found for given query</div>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}

export default SearchPage;
