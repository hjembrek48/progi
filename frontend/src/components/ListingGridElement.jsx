import { Link } from "react-router";
import placeHolderImage from "../assets/placeholder_image.png";

function ListingGridElement({ listing }) {
  let photo = placeHolderImage;
  if (listing.game.photo != undefined && listing.game.photo != "") {
    photo = listing.game.photo;
  }
  return (
    <div className="listing p-2">
      {" "}
      <Link to={`/listing/${listing.id}`} className="listing_img_container p-1">
        <img src={photo} />
      </Link>
      <div>
        <Link to={`/listing/${listing.id}`}>
          <h4>{listing.game.name}</h4>
        </Link>
        <div>Owned by: {listing.profile.email.split("@")[0]}</div>
      </div>
    </div>
  );
}

export default ListingGridElement;
