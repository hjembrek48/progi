import placeHolderImage from "../assets/placeholder_image.png";

function ListingGridElement({ listing, onOpen }) {
  let photo = placeHolderImage;
  if (listing.game.photo != undefined && listing.game.photo != "") {
    photo = listing.game.photo;
  }
  return (
    <div
      className="listing p-2"
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen ? () => onOpen(listing) : undefined}
      onKeyDown={onOpen ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(listing); } } : undefined}
      style={{ cursor: onOpen ? "pointer" : "default" }}
    >
      <div className="listing_img_container p-1">
        <img src={photo} alt={listing.game.name} />
      </div>
      <div>
        <h4 className="m-0">{listing.game.name}</h4>
        <div>Owned by: {(listing.profile && listing.profile.username) ? listing.profile.username : listing.profile?.email.split("@")[0] || "—"}</div>
      </div>
    </div>
  );
}

export default ListingGridElement;
