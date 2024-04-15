import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ImageCarousel from "../components/ImageCarousel.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const ListingView = () => {
  const { listingID } = useParams();
  const [listing, setListing] = useState(null);
  const [images, setImages] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isBookmarked, setBookmark] = useState(false);
  const hasPageBeenRendered = useRef({ activateBookmark: false });
  const [loggedID, setLoggedID] = useState(null);
  const [toggledBookmark, setBookmarkToggle] = useState(false);

  const navigate = useNavigate();
  console.log(setIsOwner);
  /* hook to fetch data when listingID changes */

  useEffect(() => {
    const fetchData = async () => {
      try {
        /* get data of listing by its ID */
        const response = await axios.get(
          `https://haggle.onrender.com/listings/${listingID}`,
        );
        
        /* set fetched data to state */
        if (response.data.length > 0) {
          setListing(response.data[0]);
          /* check currently logged-in userID */
          const token = localStorage.getItem("token"); // Retrieve the JWT token from localStorage
          if(token){
            const decodedToken = jwtDecode(token); // Decode the token
            const username = decodedToken.username; // Extract the username from the token
            try {
              // Make a request to the backend to fetch the userID based on the username
              const response2 = await axios.get(`https://haggle.onrender.com/users/userID`, { 
                params: {
                  'username': username
                }
              }, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
        
              const loggedInUserID = response2.data.userID;
              setLoggedID(loggedInUserID);
              setIsOwner(response.data[0].userID === loggedInUserID); // If userIDs are the same, we know this user owns this listing
              console.log("logged in userID: ", loggedInUserID);
              console.log("Params passed into initial bookmark status check: ", loggedInUserID, listingID);


              try {
                // Check if a bookmark exists.
                const bookmarked = await axios.get('https://haggle.onrender.com/listings/${listingID}/bookmark', {
                  params: {
                    'userID': loggedInUserID,
                    'listingID': listingID
                  }
                })
                // Set the bookmarked value to true or false.
                setBookmark(bookmarked);
              }
              catch (error) {
                console.log("Error while retrieving initial bookmark status: ", error);
              }
            }
            catch (error) {
              console.log(error);
            }

          } else{
            console.log("user not logged in or token not found");
          }
          console.log(response.data);
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      }
    };

    fetchData();
  }, [listingID]);

    /* Hook to fetch images when listingID changes */
  useEffect(() => {
    const fetchImages = async () => {
      try {
        /* Fetch images for the listing from the backend */
        const response = await axios.get(
          `https://haggle.onrender.com/listings/images/${listingID}`,
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

  const TimeAgo = (timestamp) => {
    
    const string = timestamp.toString().slice(5,7) + '/' + timestamp.toString().slice(8,10) + '/' + timestamp.toString().slice(0,4);
    //timestamp = string;
    console.log(string);
    let currentDate = new Date();
    let postDate = new Date(string);
    const difference = currentDate.getTime() - postDate.getTime();
    const differenceInDays = Math.round(difference / (1000 * 3600 * 24));
    console.log(difference);
    let message = "";
    if (differenceInDays > 1) {
      message = differenceInDays.toString() + " days ago";
    } else {
      message = differenceInDays.toString() + " day ago";
    }

    return message;
  }

  // TODO: 
  // Change visual state
  // Make Protected Route (arbitrary webpage in App.js?)

  /* Hook to change bookmark status when bookmark button is clicked. */
  useEffect(() => {
    const changeBookmark = async () => {
      // Ignore first activation on web page load and ignore initial bookmark check.
      if (hasPageBeenRendered.current["activateBookmark"] && toggledBookmark) {
        // Check if user is loggedIn
        console.log("Logged ID for bookmark check: ", loggedID);
        if (loggedID) {
          if (isBookmarked) {
            // Make call to backend to add bookmark.
            console.log("Create bookmark called.");
            createBookmark();
          }
          else if (!isBookmarked) {
            // Make call to backend to delete bookmark.
            console.log("Delete bookmark called.");
            deleteBookmark();
          }
        }
      }
      // Set bookmark hook to be active only after first load.
      hasPageBeenRendered.current["activateBookmark"] = true;
    }
    changeBookmark();
  }, [isBookmarked]);
  


  const handleBuyNow = () => {
    /* Add logic for handling "Buy Now" action */
    console.log("Buy Now clicked for listing:", listing);
    window.location.href = "/listings/:listingID/buy";
  };

  const handleMakeOffer = () => {
    /* Add logic for handling "Make Offer" action */
    console.log("Make Offer clicked for listing:", listing);
    window.location.href = "/listings/:listingID/offer";
  };

  const handleStartChat = () => {
    /* Add logic for handling "Start a Chat" action */
    console.log("Start a Chat clicked for listing:", listing);
    window.location.href = "/listings/:listingID/chat";
  };

  const handleEditListing = () => {
    /* Add logic for handling "Edit Listing" action */
    console.log("Edit Listing clicked for listing:", listing);
    navigate(`/listings/${listingID}/edit`);
  };

  const handleDeleteListing = async () => {
    console.log("Delete Listing clicked for listing:", listing);
    //window.location.href = "/listings/:listingID/delete";
    try {
      console.log("listingID deleting: ", listingID);
      await axios.delete(`https://haggle.onrender.com/listings/${listingID}`,
      );
      console.log("listing successfully deleted");
      window.location.href = '/'; // go back to home page
    } catch (error){
      console.error("error deleting listing", error);
    }
  };

  // Toggle the local bookmark status.
  const toggleBookmark = () => {
    console.log("Toggle Bookmark clicked for listing: ", listing);
    setBookmarkToggle(true);
    console.log("Current bookmark status: ", isBookmarked);
    setBookmark(!isBookmarked);
    console.log("New bookmark status: ", isBookmarked);
  }

  // Create Bookmark in database.
  const createBookmark = async () => {
    // Post bookmark to database.
    console.log("Create Bookmark clicked for listing: ", listing);
    try {
      console.log("Posting bookmark.");
      await axios.post(
        `https://haggle.onrender.com/listings/${listingID}/bookmark`, {
          params: {
            'userID': loggedID,
            'listingID': listingID
          }
        }
      )
      console.log("Posted bookmark.")
    }
    // Set an error while posting the bookmark data.
    catch (error) {
      console.error("Error creating bookmark: ", error)
    }
  };

  // Delete bookmark from database.
  const deleteBookmark = async () => {
    console.log("Delete Bookmark clicked for listing: ", listing);
    try {
      console.log("Deleting bookmark.");
      const response = await axios.delete('https://haggle.onrender.com/listings/${listingID}/bookmark')
      // TODO: Handle Response
      console.log("Deleted bookmark: ", response);
    }
    catch (error) {
      console.error("Error deleting bookmark on frontend: ", error);
    }
  };

  if (!listing) {
    return (
      <LoadingSpinner/>
    );
  }

  /* first check if listing data is available, then render */
  return (
    <div className="medium-container">
      <div className="flex-row">
        <div>
          <ImageCarousel images={images} />
        </div>
        <div className="margin-left">
          <h1>{listing.title}</h1>
          <p>Posted {TimeAgo(listing.postDate)}</p>
          <h5 style={{color: "green"}}>${listing.price}</h5>
          <p>{listing.description}</p>
        </div>
      </div>
      <div className="text-right margin-top">
        {isOwner && (
          <>
            <button className="muted-button margin-right" onClick={handleEditListing}>Edit Listing</button>
            <button className="muted-button margin-right" onClick={handleDeleteListing}>Delete Listing</button>
          </>
        )}
            <button className="margin-right" onClick={handleBuyNow}>Buy Now</button>
            <button className="margin-right" onClick={handleMakeOffer}>Make Offer</button>
            <button className="margin-right" onClick={handleStartChat}>Start a Chat</button>
            <button className="margin-right" onClick={toggleBookmark}>Bookmark</button>
        </div>
    </div>
  );
};

export default ListingView;