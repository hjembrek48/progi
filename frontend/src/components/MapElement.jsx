import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

function ClickEvent({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition({ latlng: e.latlng, lastUpdate: Date.now() });
    },
  });

  return position.latlng === null ? null : (
    <Marker position={position.latlng}></Marker>
  );
}

export function MapElement({ location, setLocation, className }) {
  return (
    <MapContainer
      center={[44.755, 17.26]}
      zoom={7}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      className={className}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickEvent position={location} setPosition={setLocation} />
    </MapContainer>
  );
}
