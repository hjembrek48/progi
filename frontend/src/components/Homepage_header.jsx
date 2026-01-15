import { Button, FormControl } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router";
import "./../styles/homepage.css";
import logo from "../assets/Logo_cropped.png";

export function Homepage_header() {
  const navigate = useNavigate();

  return (
    <div className="home_header p-2 d-flex justify-content-between align-items-center">
      <Link to="/" style={{ minWidth: "300px" }}>
        <img
          src={logo}
          alt="PlayTrade logo"
          className="logo img-fluid logo_nav"
        />
      </Link>
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
