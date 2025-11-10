import { Container, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import apiAuth from "./../services/apiAuth.js";
import { deleteTokenFromVariable } from "../services/auth.js";
import "./../styles/loginpage.css";
import { MapElement } from "../components/MapElement.jsx";
import axios from "axios";

export function Login_add_location() {
  const navigate = useNavigate();
  const [warningMess, setWarningMess] = useState("");
  const [location, setLocation] = useState({
    latlng: null,
    lastUpdate: null,
  });
  const [address, setAddress] = useState({
    address: null,
    loading: false,
  });

  useEffect(() => {
    async function fetchData() {
      const data = await apiAuth.get(
        "http://localhost:8000/api/profile/location/"
      );

      if (data.data.latitude != null || data.data.longitude != null) {
        navigate("/");
      }
    }
    fetchData();
  });

  useEffect(() => {
    if (location.latlng == null) {
      return;
    }
    setAddress({ ...address, loading: true });
    setWarningMess("");
    const timeoutId = setTimeout(async () => {
      if (location.latlng == null) {
        return;
      }
      const data = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            lat: location.latlng.lat,
            lon: location.latlng.lng,
            format: "json",
            zoom: 13,
          },
        }
      );
      const json = data.data;
      const placeName =
        json.address.city ??
        json.address.town ??
        json.address.village ??
        json.name;
      const newAddress = `${placeName}, ${json.address.country}`;
      setAddress({ address: newAddress, loading: false });
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [location]);

  const sendAddress = async () => {
    if (address.address == null) {
      setWarningMess("Please select your location on the map");
      return;
    }
    try {
      const data = await apiAuth.put(
        "http://localhost:8000/api/profile/location/",
        {
          latitude: location.latlng.lat.toFixed(6),
          longitude: location.latlng.lng.toFixed(6),
          address: address.address,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      navigate("/");
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

  const logoutUser = async () => {
    try {
      await apiAuth.post("logout/");
      //ako je uspješno -> 200:
      deleteTokenFromVariable();
      navigate("/login");
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

  return (
    <Container className="body_container add-location-container p-4">
      <h2>Please, select your location:</h2>
      <Container className="map_container">
        <MapElement location={location} setLocation={setLocation} />
      </Container>
      <div className="d-flex justify-content-between">
        <Button className="home_button" onClick={logoutUser}>
          Select different Google account
        </Button>
        <div className="align-self-center ms-auto m-2 align-content-center">
          {address.loading === true ? (
            <Spinner />
          ) : (
            <div className="fs-5 fw-medium">{address.address}</div>
          )}
        </div>
        <Button
          className="home_button"
          onClick={sendAddress}
          disabled={address.loading === true}
        >
          Confirm location
        </Button>
      </div>
      {warningMess && (
        <Alert
          variant="danger"
          className="my_alert mt-4"
          onClose={() => {
            setWarningMess("");
          }}
          dismissible
        >
          <Alert.Heading>Error!</Alert.Heading>
          <p className="text-center">{warningMess}</p>
        </Alert>
      )}
    </Container>
  );
}
