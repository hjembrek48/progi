import { Button, FormControl } from "react-bootstrap";
import { CgProfile, CgSearch } from "react-icons/cg";
import { RiLogoutBoxLine } from "react-icons/ri";
import { useAuth } from "./AuthProvider";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import apiAuth from "../services/apiAuth.js";
import { deleteTokenFromVariable } from "../services/auth.js";
import "./../styles/homepage.css";
import logo from "../assets/Logo_cropped.png";

export function Logged_homepage_header() {
  const { registrationStep, setRegistrationStep } = useAuth();
  const [warningMess, setWarningMess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const logout = async () => {
    try {
      await apiAuth.post("logout/");
      deleteTokenFromVariable();
      setRegistrationStep(1);
    } catch (error) {
      if (error.response) {
        console.log(error.response.data.detail);
        setWarningMess(error.response.data.detail);
      } else {
        console.log("Network error or server down!");
        setWarningMess("Server unreachable!");
      }
    }
  };

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
      {registrationStep > 2 ? (
        <div
          className="d-flex gap-3 justify-content-end"
          style={{ minWidth: "300px" }}
        >
          <Button
            className="home_button d-flex flex-column align-items-center"
            onClick={() => {
              navigate("/profile");
            }}
          >
            <CgProfile />
            <h5>My Profile</h5>
          </Button>
          <Button
            className="home_button d-flex flex-column align-items-center"
            onClick={logout}
          >
            <h5>Logout</h5>
            <RiLogoutBoxLine />
          </Button>
        </div>
      ) : (
        <div>
          <Button
            className="home_button"
            onClick={() => {
              navigate("/login");
            }}
          >
            Log In
          </Button>
        </div>
      )}
    </div>
  );
}
