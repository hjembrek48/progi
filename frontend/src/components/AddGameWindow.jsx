import { Button, Form, Container, FloatingLabel, ListGroup } from "react-bootstrap";
import ReactStars from "react-rating-stars-component";
import { FaStar } from "react-icons/fa";
import { VscPerson } from "react-icons/vsc";
import { useState, useEffect } from "react";
import apiAuth from "../services/apiAuth";
import "./../styles/homepage.css";
import { Error_component } from "./Error_component";

export function AddGameWindow({ onClose, onGameAdded }) {
    const [addingStage, setAddingStage] = useState(1);
    const [genres, setGenres] = useState([]);
    const [gamesFromBGG, setGamesFromBGG] = useState([]); //sve igre koje server vrati kao objekt s BGG
    const [formError, setFormError] = useState(""); //UX podsjetnik na errore kod Confirma
    const [addToListing, setAddToListing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [bgName, setBgName] = useState(""); //kada korisnik upisuje name, svako slovo se na promjenu sprema ovdje
    const [selectedBoardGame, setSelectedBoardGame] = useState(null); //ovdje se sprema odabrani board game iz padajućeg izbornika
    const [bgGenreId, setBgGenreId] = useState("");
    const [bgPublisher, setBgPublisher] = useState("");
    const [bgYear, setBgYear] = useState("");
    const [bgPreservation, setBgPreservation] = useState(0);
    const [bgPlayersNum, setBgPlayersNum] = useState("");
    const [bgPlayTime, setBgPlayTime] = useState("");
    const [bgComplexity, setBgComplexity] = useState("");
    const [bgDesc, setBgDesc] = useState("");
    const [bgPhotoFile, setBgPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    //polja koja korisnik unosi: Name (do odabira)

    const [nameError, setNameError] = useState("");
    const [genreError, setGenreError] = useState("");
    const [publisherError, setPublisherError] = useState("");
    const [photoError, setPhotoError] = useState("");

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
    }, [addingStage])

    useEffect(() => {
        if(!bgName || bgName.length < 2 || selectedBoardGame) {
            setGamesFromBGG([]);
            return;
        }

        const timer = setTimeout(() => {
            const fetchNames = async () => {
                try {
                    const res = await apiAuth.get("boardgames/autocomplete/", {
                        params: {query: bgName}
                    });
                    setGamesFromBGG(res.data);
                } catch (e) {
                    console.log("Failed to fetch game names!")
                }
            };
            fetchNames();
        }, 400); //400 ms čeka do poziva ako se prođe gornji if (tekst >= 2 i nije već postavljeno ime, ili prazno) -> debounce - sprečava višak poziva

        return () => clearTimeout(timer); //ako korisnik tipka brzo prekini stare pozive
    }, [bgName, selectedBoardGame])


    const handleConfirm = async () => {
        if(isSubmitting) return;
        setIsSubmitting(true);
        let hasErrors = false;

        //Odabrana igra:
        if(!selectedBoardGame) {
            setFormError("You need to select valid game name!");
            hasErrors = true;
        } else {
            setFormError("");
        }

        //Name:
        if(!bgName) {
            setNameError("Game Name is required!");
            hasErrors = true;
        } else {
            setNameError("");
        }

        //Genre:
        if(!bgGenreId) {
            setGenreError("Game Genre is required!");
            hasErrors = true;
        } else {
            setGenreError("");
        }

        //Publisher:
        if(!bgPublisher) {
            setPublisherError("Game Publisher is required!");
            hasErrors = true;
        } else {
            setPublisherError("");
        }

        //Photo:
        if(!bgPhotoFile) {
            setPhotoError("Game Photo is required!");
            hasErrors = true;
        } else if(bgPhotoFile.type != "image/jpeg" && bgPhotoFile.type != "image/png") {
            setPhotoError("Only .jpg, .jpeg and .png files allowed!");
            setFormError("Only .jpg, .jpeg and .png files allowed!");
            hasErrors = true;
        } else if(bgPhotoFile.size > 2 * 1024 * 1024) {
            setPhotoError("File too big! Allowed size is up to 2MB.");
            setFormError("File too big! Allowed size is up to 2MB.");
            hasErrors = true;
        } else {
            setPhotoError("");
        }

        if(!hasErrors) {
            const form_data = new FormData();
            const game_id = parseInt(selectedBoardGame.id);
            if(!isNaN(game_id)) {
                form_data.append("board_game_id", game_id);
            } else {
                console.log("Error with game id!");
                return;
            }

            form_data.append("description", bgDesc);
            form_data.append("publisher", bgPublisher);

            if(addToListing) {
                form_data.append("active", Boolean(true));
            } else {
                form_data.append("active", Boolean(false));
            }

            const grade = parseInt(bgPreservation);
            if(!isNaN(grade)) {
                form_data.append("grade", grade);
            } else {
                console.log("Error with game id!");
                return;
            }

            const genre_idd = parseInt(bgGenreId);
            if(!isNaN(genre_idd)) {
                form_data.append("genre_id", genre_idd);
            } else {
                console.log("Error with genre id!");
                return;
            }

            form_data.append("photo", bgPhotoFile);

            try {
                const res = await apiAuth.post("/games/", form_data, {
                                headers: {"Content-Type": "multipart/form-data"}
                            });

                if(addToListing) {
                    try {
                        await apiAuth.post("listings/", {
                            game_id: res.data.id,
                            description: res.data.description || ""
                        });
                    } catch (listingsErr) {
                        console.log("Error occured while creating listing!");
                        console.log(listingsErr.response?.data);
                    }
                }
                
                onGameAdded(); //vraćamo novu igru roditelju - pozivamo fetch
                onClose();
            } catch (err) {
                console.log(err.response?.data);
                console.log("Error while adding game!");
                setFormError("Failed to add game! Try again!");
            } finally {
                setIsSubmitting(false);
            }
        }
        setIsSubmitting(false);
    }

    const handleNameChange = (e) => {
        let name = e.target.value;
        if(name == "") {
            setSelectedBoardGame(null);
            setGamesFromBGG([]);
            setNameError("Game Name is required!");
        } else {
            setNameError("");
        }
        setBgName(name);
        if(addingStage > 1) setAddingStage(1);
        setSelectedBoardGame(null);
        setBgPublisher("");
        setBgGenreId("");
        setBgPreservation(0);
        setBgDesc("");
    }

    const handleSelectGame = async (game) => {
        setBgName(game.name);
        setSelectedBoardGame(game);
        
        const id = parseInt(game.bgg_id);
        if (isNaN(id)) {
            setSelectedBoardGame(null);
            setGamesFromBGG([]);
            return;
        }

        try {
            const result = await apiAuth.get(`boardgames/${id}/`);
            setBgYear(result.data.year_published);
            setBgPlayersNum(result.data.max_players);
            setBgPlayTime(result.data.playing_time);
            setBgComplexity(parseFloat(result.data.complexity).toFixed(1));

            const image_url = result.data.image_url;
            if(image_url) {
                setPhotoPreview(image_url.replace("http:", "https:"));
            } else {
                setPhotoPreview(null);
            }
        } catch (e) {
            console.log("Error fetching board game details:", e);
        }
        setGamesFromBGG([]);
        setAddingStage(2);
    }

    const handleGenreChange = (e) => {
        let genre_id = e.target.value;
        if(genre_id == "") {
            setGenreError("Game Genre is required!");
        } else {
            setGenreError("");
        }
        setBgGenreId(genre_id);
    }

    const handlePublisherChange = (e) => {
        let publisher = e.target.value;
        if(publisher == "") {
            setPublisherError("Game Publisher is required!");
        } else {
            setPublisherError("");
        }
        setBgPublisher(publisher);
    }

    const handlePhotoChange = (e) => {
        const photo_file = e.target.files[0]; //imamo fileList s jednim elementom - našom slikom
        if(!photo_file) {
            setPhotoError("Game Photo is required!");
            setBgPhotoFile(null);
            setPhotoPreview(null);
            e.target.value = null;
            return;
        }
        if(photo_file.type != "image/jpeg" && photo_file.type != "image/png") { //provjera tipa
            setPhotoError("Only .jpg, .jpeg and .png files allowed!");
            setBgPhotoFile(null);
            setPhotoPreview(null);
            e.target.value = null;
            return;
        }
        if(photo_file.size > 2 * 1024 * 1024) { //provjera veličine - dozvoljeno 2MB
            setPhotoError("File too big! Allowed size is up to 2MB.");
            setBgPhotoFile(null);
            setPhotoPreview(null);
            e.target.value = null;
            return;
        }
        setPhotoError("");
        setBgPhotoFile(photo_file);
        setPhotoPreview(URL.createObjectURL(photo_file)); //privremeni URL na file u memoriji (za preview)
    }

    return(
        <div className="add_game_background">
            <Container className="add_game_container p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="add_game_header">Add Game</h3>
                </div>
            <Form>
                <Container className="list_group_wrap">
                    <FloatingLabel controlId="gameName" className="add_game_label" label="Game Name">
                        <Form.Control 
                        type="text"
                        placeholder=""
                        value={bgName}
                        onChange={handleNameChange}
                        isInvalid={nameError == "" ? false : true}
                        />
                        <Form.Control.Feedback type="invalid">
                            {nameError}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                    {(gamesFromBGG.length > 0) &&
                        <ListGroup className="autocomplete_group">
                            {gamesFromBGG.map((game) => {
                                return(
                                    <ListGroup.Item
                                    as="button"
                                    type="button"
                                    key={game.id}
                                    action
                                    onClick={() => {handleSelectGame(game)}}
                                    >
                                        {game.name}
                                    </ListGroup.Item>
                                )
                            })}
                        </ListGroup>
                    }
                </Container>
                {(addingStage < 2) &&
                <Error_component error_text={formError} clearError={setFormError} />
                }
                {(addingStage == 2) &&
                <Container>
                    <FloatingLabel controlId="gameGenre" className="add_game_label" label="Game Genre">
                        <Form.Select
                        value={bgGenreId}
                        onChange={handleGenreChange}
                        isInvalid={genreError == "" ? false : true}
                        >
                            <option value="">Please, select game genre</option>
                            {
                                genres.map((genre) => {
                                    return(
                                    <option value={genre.id} key={genre.id}>
                                        {genre.name}
                                    </option>);
                                })
                            }
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {genreError}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                    <FloatingLabel controlId="gamePublisher" className="add_game_label" label="Game Publisher">
                        <Form.Control 
                        type="text"
                        placeholder=""
                        value={bgPublisher}
                        onChange={handlePublisherChange}
                        isInvalid={publisherError == "" ? false : true}
                        />
                        <Form.Control.Feedback type="invalid">
                            {publisherError}
                        </Form.Control.Feedback>
                    </FloatingLabel>

                    <FloatingLabel controlId="gameYear" className="add_game_label" label="Year of Publication">
                        <Form.Control 
                        type="number"
                        value={bgYear}
                        disabled
                        />
                    </FloatingLabel>

                    <Form.Group>
                    <Form.Label className="add_game_label">Preservation Rate</Form.Label>
                        <Container className="rating_container">
                            <ReactStars
                                count={5}
                                size={30}
                                value={bgPreservation}
                                onChange={(newRating) => setBgPreservation(newRating)}
                                emptyIcon={<FaStar />}
                                filledIcon={<FaStar />}
                                activeColor="#ffd700"
                                edit={true}
                            />
                        </Container>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label className="add_game_label">Number Of Players</Form.Label>
                        <Container className="rating_container">
                            <ReactStars
                                count={parseInt(bgPlayersNum)}
                                size={30}
                                value={bgPlayersNum}
                                emptyIcon={<VscPerson />}
                                filledIcon={<VscPerson />}
                                activeColor="#100071"
                            />
                        </Container>
                    </Form.Group>

                    <FloatingLabel controlId="gamePlayTime" className="add_game_label" label="Playing Time (min)">
                        <Form.Control 
                        type="number"
                        value={parseInt(bgPlayTime)}
                        disabled
                        />
                    </FloatingLabel>

                    <Form.Group>
                        <Form.Label className="add_game_label">Game Complexity</Form.Label>
                            <Form.Control
                            type="text"
                            value={bgComplexity}
                            disabled
                            />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label className="add_game_label">Game Photo</Form.Label>
                            <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            isInvalid={photoError == "" ? false : true}
                            />
                            <Form.Control.Feedback type="invalid">
                                {photoError}
                            </Form.Control.Feedback>
                    </Form.Group>
                    {photoPreview && 
                        <div className="photo_preview_div">
                            <img src={photoPreview} alt="preview"></img>
                        </div>}
                    <Form.Group>
                        <Form.Label className="add_game_label">Game Description</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3}
                            value={bgDesc}
                            onChange={(e) => {setBgDesc(e.target.value)}}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Check 
                        type="checkbox"
                        label="Do you want to add this game to listing?"
                        checked={addToListing}
                        onChange={(e) => {setAddToListing(e.target.checked)}}
                        />
                    </Form.Group>
                </Container>
            }
            </Form>
            <div className="d-flex justify-content-end mt-3 gap-2">
                <Button className="home_button" onClick={onClose}>Cancel</Button>
                <Button 
                className="home_button" 
                onClick={handleConfirm}
                disabled={isSubmitting ? true : false}
                >
                {isSubmitting ? "Adding..." : "Confirm"}
                </Button>
            </div>
        </Container>
    </div>);
}