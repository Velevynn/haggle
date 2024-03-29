import React, { useState, useEffect } from "react";
import axios from "axios";
import "./marketplace-entry.css";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import missing from "../assets/missing.jpg"

function Entry({ title, price, listingID }) {
  const [images, setImages] = useState([]);

  const getTitleFontSize = () => {
    if (title != undefined) {
      if (title.length > 21) {
        return "15px";
      } else if (title.length > 14) {
        return "20px";
      } else {
        return "25px";
      }
    } else {
      return "10px";
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        /* Fetch images for the listing from the backend */
        const response = await axios.get(
          `http://localhost:8000/listings/images/${listingID}`,
        );
        if (response.data.length > 0) {
          setImages(response.data);
          console.log(response.data);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, [listingID]);

  let source = missing;
  // const randomNum = (Math.random(2000)).toString();  // generate random num
  // let source = `https://haggleimgs.s3.amazonaws.com/${listingID}/image0?cc=${randomNum}`;  

  if (images.length > 0) {
    source = `https://haggleimgs.s3.amazonaws.com/${listingID}/image0`;  
    // in future, add check to see if the image is in the server, set source as missing if that is the case
  }
  // request img from AWS, add random query to circumvent browser caching

  return (
    <Link to={`/listings/${listingID}`} className="entry-link">
      <div className="entry-container">
        <div className="image-container">
          <img src = {source} alt="Entry Image" className="entry-image" />
        </div>

        <div className="text-container">
          <h2 className="title" style={{ fontSize: getTitleFontSize() }}>
            {title}
          </h2>
          <p className="price">{price === "0.00" ? "FREE" : `$${price}`}</p>
        </div>
      </div>
    </Link>
  );
}

Entry.propTypes = {
  title: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  listingID: PropTypes.number.isRequired,
};

export default Entry;