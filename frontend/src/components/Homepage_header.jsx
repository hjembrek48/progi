import { Button, FormControl } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router";
import "./../styles/homepage.css";
import logo from "../assets/Logo_cropped.png";
import { CgSearch } from "react-icons/cg";

export function Homepage_header() {
  const navigate = useNavigate();
  const location = useLocation();

  async function onSearchSubmit(formEvent) {
    formEvent.preventDefault();
    const formData = new FormData(formEvent.target);

    const query = formData.get("query");
    navigate(`/search/?search=${query}`);
  }

  return (
    <div className="home_header p-2 d-flex justify-content-between align-items-center">
      <Link to="/" style={{ minWidth: "300px" }}>
        <img src={logo} alt="PlayTrade logo" className="logo img-fluid" />
      </Link>
      <div className="home_search_bar">
        {location.pathname.match("/search/{0,1}") ? (
          <div></div>
        ) : (
          <form className="d-flex gap-2" onSubmit={onSearchSubmit}>
            <FormControl
              placeholder="Search games"
              type="text"
              name="query"
            ></FormControl>
            <Button className="home_button" type="submit">
              <CgSearch />
            </Button>
          </form>
        )}
      </div>
      <Button
        className="home_button"
        onClick={() => {
          navigate("/login");
        }}
      >
        Log In
      </Button>
    </div>
  );
}
