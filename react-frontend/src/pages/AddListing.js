import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function AddListing() {
  const [listing, setListing] = useState({
    userID: null,
    title: "",
    description: "",
    price: "",
    expirationDate: null,
    quantity: 1,
    images: []
  });

  function handleChange(event) {
    const { name, value } = event.target;
    if (name === "price") {
      if (!isNaN(value)) {
        // Update the state only if the value is a valid number
        setListing((prevListing) => ({
          ...prevListing,
          [name]: value, // Update "price" with the parsed number value
        }));
      }
    } else {
      setListing((prevListing) => ({
        ...prevListing,
        [name]: value,
      }));
    }
  }

  function handleImageChange(event) {
    const files = Array.from(event.target.files);
    setListing(prevListing => ({
      ...prevListing,
      images: files
    }));
  }

  async function submitForm() {
    if (listing.title !== "" && listing.price !== "") {
      const token = localStorage.getItem("token"); // Retrieve the JWT token from localStorage
      const decodedToken = jwtDecode(token); // Decode the token
      const username = decodedToken.username; // Extract the username from the token
  
      try {
        // Make a request to the backend to fetch the userID based on the username
        const response = await axios.get(`https://haggle.onrender.com/users/userID`, { 
          params: {
            'username': username
          }
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        const userID = response.data.userID;
  
        const formData = new FormData();
        formData.append('userID', userID); // Include the userID in the form data
        formData.append('title', listing.title);
        formData.append('description', listing.description);
        formData.append('price', listing.price);
        formData.append('expirationDate', listing.expirationDate);
        formData.append('quantity', listing.quantity);
        listing.images.forEach((image) => {
          formData.append(`image`, image);
        });
        
        try {
          await axios.post('https://haggle.onrender.com/listings', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          window.location.href = '/marketplace';
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
  
  
  

  return (
    <div className="small-container" style={{ fontFamily: "Inter" , boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
      <h3 className="vertical-center">Post Listing</h3>
      <form className="">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          name="title"
          id="title"
          value={listing.title}
          onChange={handleChange}
        />
        <label htmlFor="description">Description</label>
        <textarea
          type="text"
          name="description"
          id="description"
          value={listing.description}
          onChange={handleChange}
        />
        <label htmlFor="price">Price</label>
        <input
          type="text"
          name="price"
          id="price"
          value={listing.price}
          onChange={handleChange}
        />
      

        {/*For displaying how many images have been selected*/}
        {listing.images.length > 0 && (
          <p>{listing.images.length} image(s) selected</p>
        )}


        
      </form>
      <div className="vertical-center">
        <div className="margin-top">
          <label htmlFor="images" className="button">
            <span>Select Images</span>
            <input
              type="file"
              name="images"
              id="images"
              accept="image/*"
              multiple
              className="custom-file-input"
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>
      <div className="vertical-center" >
        <button className="margin-top" onClick={submitForm}>Post Listing</button>
      </div>
    </div>
  );
}

export default AddListing;