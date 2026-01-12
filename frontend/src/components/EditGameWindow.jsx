import { Button, Form, Container, FloatingLabel, ListGroup } from "react-bootstrap";
import ReactStars from "react-rating-stars-component";
import { FaStar } from "react-icons/fa";
import { VscPerson } from "react-icons/vsc";
import { useState, useEffect } from "react";
import apiAuth from "../services/apiAuth";
import { FaPencil } from "react-icons/fa6";
import "./../styles/homepage.css";

export function EditGameWindow({ game, onDone }) {
    const [genres, setGenres] = useState([]);
    const [formError, setFormError] = useState("");

    const bgName = game.board_game?.name;
    const [bgGenreId, setBgGenreId] = useState(game.genre_id);
    const [bgPublisher, setBgPublisher] = useState(game.publisher);
    const bgYear = game.board_game?.year_published;
    const [bgPreservation, setBgPreservation] = useState(game.grade);
    const bgPlayersNum = game.board_game?.max_players;
    const bgPlayTime = game.board_game?.playing_time;
    const bgComplexity = game.board_game?.complexity;
    const [bgDesc, setBgDesc] = useState(game.description);
    const [bgPhotoFile, setBgPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(game.photo || game.board_game?.image_url);

    const [genreError, setGenreError] = useState("");
    const [publisherError, setPublisherError] = useState("");
    const [photoError, setPhotoError] = useState("");

    const [editFields, setEditFields] = useState({
        genre: false,
        publisher: false,
        preservation: false,
        photo: false,
        description: false
    });

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

    //Treba nam novi objekt koji mapira sva izmjenjena polja na true, a ostala ostavlja na false
    //field je polje koje mijenjamo na true pritiskom gumba
    //prev je prošlo stanje objekta i mi uzimamo svaki njegov element te samo field stavljamo na true
    const enableEdit = (field) => {
        setEditFields(prev => ({ ...prev, [field]: true }));
    };

    const handleConfirm = async () => {
        let hasErrors = false;

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

            form_data.append("description", bgDesc);

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
                const res = await apiAuth.patch(`/games/${game.id}/`, form_data, {
                                headers: {"Content-Type": "multipart/form-data"}
                            });
            } catch (err) {
                console.log(err.response?.data);
                console.log("Error while adding game!");
                setFormError("Failed to add game! Try again!");
            }
        }
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
                    <h3 className="add_game_header">Edit Game</h3>
                </div>
            <Form>
                <Container className="list_group_wrap">
                    <FloatingLabel controlId="gameName" className="add_game_label" label="Game Name">
                        <Form.Control 
                        type="text"
                        value={bgName}
                        disabled
                        />
                    </FloatingLabel>
                </Container>
                <Container>
                    <FloatingLabel controlId="gameGenre" className="add_game_label" label="Game Genre">
                        <Form.Select
                        value={bgGenreId}
                        onChange={handleGenreChange}
                        isInvalid={genreError == "" ? false : true}
                        disabled={!editFields.genre}
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
                        <Button className="p-0 ms-2" onClick={() => enableEdit("description")}>
                            <FaPencil />
                        </Button>
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
                        disabled={!editFields.publisher}
                        />
                        <Button className="p-0 ms-2" onClick={() => enableEdit("description")}>
                            <FaPencil />
                        </Button>
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
                                edit={editFields.preservation}
                            />
                        </Container>
                        <Button className="p-0 ms-2" onClick={() => enableEdit("description")}>
                            <FaPencil />
                        </Button>
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

                    <FloatingLabel controlId="gamePlayTime" className="add_game_label" label="Playing Time (h)">
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
                            disabled={!editFields.photo}
                            />
                            <Button className="p-0 ms-2" onClick={() => enableEdit("description")}>
                                <FaPencil />
                            </Button>
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
                            disabled={!editFields.description}
                        />
                        <Button className="p-0 ms-2" onClick={() => enableEdit("description")}>
                            <FaPencil />
                        </Button>
                    </Form.Group>
                    </Container>
                </Form>
                <div className="d-flex justify-content-end mt-3 gap-2">
                    <Button className="home_button" onClick={() => {
                        onDone();
                        handleConfirm();
                    }}>Done</Button>
                </div>
            </Container>
        </div>
    );
}