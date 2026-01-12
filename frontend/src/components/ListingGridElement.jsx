import placeHolderImage from "../assets/placeholder_image.png";

function ListingGridElement({ listing }) {
  let photo = placeHolderImage;
  if (listing.game.photo != undefined && listing.game.photo != "") {
    photo = listing.game.photo;
  }
  return (
    <div className="listing p-2">
      {" "}
      <div className="listing_img_container p-1">
        <img src={photo} />
      </div>
      <div>
        <h4>{listing.game.name}</h4>
        <div>Owned by: {listing.profile.email}</div>
      </div>
    </div>
  );
}

export default ListingGridElement;
